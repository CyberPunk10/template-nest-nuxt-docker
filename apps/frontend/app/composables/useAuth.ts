interface AuthUser {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export function useAuth() {
  const { $api } = useNuxtApp()
  const router = useRouter()
  const user = useState<AuthUser | null>('auth.user', () => null)

  async function login(email: string, password: string) {
    const me = await $api<AuthUser>('/auth/login', { method: 'POST', body: { email, password } })
    user.value = me
  }

  async function register(name: string, email: string, password: string) {
    user.value = await $api<AuthUser>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    })
    user.value = me
  }

  async function logout() {
    await $api('/auth/logout', { method: 'POST' })
    user.value = null
    await router.push('/login')
  }

  return { user, login, logout, register }
}
