import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { createHmac } from 'crypto'
import { Response, Request } from 'express'
import { randomUUID } from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { User } from '../../generated/prisma/client'
import { JwtPayload } from './strategies/jwt.strategy'

type SafeUser = Omit<User, 'passwordHash'>

@Injectable()
export class AuthService {
  private readonly BCRYPT_ROUNDS = 12

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) return null
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return null
    const { passwordHash: _, ...safeUser } = user
    return safeUser
  }

  async register(dto: RegisterDto, req: Request, res: Response): Promise<SafeUser> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email already in use')

    const passwordHash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS)
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash },
    })

    await this.issueTokens(user, req, res)

    const { passwordHash: _, ...safeUser } = user
    return safeUser
  }

  async login(user: SafeUser, req: Request, res: Response): Promise<SafeUser> {
    const fullUser = await this.prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    await this.issueTokens(fullUser, req, res)
    return user
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const token: string | undefined = req.cookies?.['refresh_token']
    if (!token) throw new UnauthorizedException()

    const tokenHash = this.hmac(token)
    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
    })

    if (!session) throw new UnauthorizedException()

    if (session.isUsed) {
      // Токен уже был использован — компрометация цепочки, инвалидируем только эту семью
      await this.prisma.session.deleteMany({ where: { familyId: session.familyId } })
      this.clearCookies(res)
      throw new UnauthorizedException()
    }

    if (session.expiresAt <= new Date()) {
      await this.prisma.session.delete({ where: { id: session.id } })
      throw new UnauthorizedException()
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { isUsed: true, lastUsedAt: new Date() },
    })

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: session.userId } })
    await this.issueTokens(user, req, res, session.familyId)
  }

  async logout(req: Request, res: Response): Promise<void> {
    const token: string | undefined = req.cookies?.['refresh_token']
    if (token) {
      const tokenHash = this.hmac(token)
      await this.prisma.session.delete({ where: { refreshTokenHash: tokenHash } })
    }
    this.clearCookies(res)
  }

  private async issueTokens(
    user: User,
    req: Request,
    res: Response,
    familyId?: string,
  ): Promise<void> {
    const payload: JwtPayload = { sub: user.id, email: user.email }
    const accessToken = this.jwtService.sign(payload)

    const refreshToken = randomUUID()
    const refreshTokenHash = this.hmac(refreshToken)
    const expiresInDays = this.config.get<number>('REFRESH_TOKEN_EXPIRES_DAYS', 7)
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)

    await this.prisma.session.create({
      data: {
        userId: user.id,
        familyId: familyId ?? randomUUID(),
        refreshTokenHash,
        expiresAt,
        userAgent: req.headers['user-agent'] ?? null,
        ip: req.ip ?? null,
      },
    })

    const isProd = process.env.NODE_ENV === 'production'
    const cookieOptions = { httpOnly: true, sameSite: 'strict' as const, secure: isProd }
    const refreshMaxAge = expiresInDays * 24 * 60 * 60 * 1000

    res.cookie('access_token', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    res.cookie('refresh_token', refreshToken, { ...cookieOptions, maxAge: refreshMaxAge })
  }

  private clearCookies(res: Response): void {
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
  }

  private hmac(token: string): string {
    return createHmac('sha256', this.config.getOrThrow<string>('REFRESH_TOKEN_SECRET'))
      .update(token)
      .digest('hex')
  }
}
