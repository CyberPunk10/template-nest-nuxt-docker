interface UserMock {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export function useUserMock() {
  const user = useState<UserMock | null>('user.mock', () => ({
    id: '1000',
    name: 'Joi',
    email: 'joi@mail.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))

  return { user }
}
