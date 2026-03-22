import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from './api'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: () => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<User>('/api/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = () => {
    const apiUrl = import.meta.env.VITE_API_URL || ''
    window.location.href = `${apiUrl}/api/auth/google`
  }

  const logout = async () => {
    await api.post('/api/auth/logout', {}).catch(() => undefined)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
