import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const isHttp = exception instanceof HttpException
    const statusCode = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const message = isHttp
      ? ((exception.getResponse() as { message?: string }).message ?? exception.message)
      : 'Internal server error'

    response.status(statusCode).json({
      statusCode,
      message,
      path: request.url,
    })
  }
}
