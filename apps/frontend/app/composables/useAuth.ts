interface AuthUser {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

// Заглушка вместо реальной сессии (нет JWT) — просто сохраняем последнего
// залогиненного пользователя в cookie, чтобы не выкидывало на /login при
// каждой перезагрузке страницы. Cookie (не localStorage), т.к. её видно и
// на SSR — иначе middleware на сервере не узнает про сессию из браузера.
const STUB_SESSION_COOKIE = 'auth-stub-fake-session-user'

export function useAuth() {
  const { $api } = useNuxtApp()
  const router = useRouter()
  const sessionCookie = useCookie<AuthUser | null>(STUB_SESSION_COOKIE, {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30,
  })
  const user = useState<AuthUser | null>('auth.user', () => sessionCookie.value)

  async function login(email: string, password: string) {
    const me = await $api<AuthUser>('/auth/login', { method: 'POST', body: { email, password } })
    user.value = me
    sessionCookie.value = me
  }

  async function register(name: string, email: string, password: string) {
    const me = await $api<AuthUser>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    })
    user.value = me
    sessionCookie.value = me
  }

  async function logout() {
    await $api('/auth/logout', { method: 'POST' })
    user.value = null
    sessionCookie.value = null
    await router.push('/login')
  }

  return { user, login, logout, register }
}
