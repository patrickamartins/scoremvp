import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../services/api'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'player' | 'coach' | 'analyst' | 'team'
  plan: 'free' | 'pro' | 'team'
  isActive: boolean
  phone?: string
  team?: string
  favoriteTeam?: string
  document?: string
  profileImage?: string
}

interface AuthContextData {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  updateUser: (userData: User) => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('@ScoreMVP:user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user: userData, token } = response.data

      setUser(userData)
      localStorage.setItem('@ScoreMVP:user', JSON.stringify(userData))
      localStorage.setItem('@ScoreMVP:token', token)

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } catch (error) {
      throw new Error('Erro ao fazer login')
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('@ScoreMVP:user')
    localStorage.removeItem('@ScoreMVP:token')
    delete api.defaults.headers.common['Authorization']
  }

  const updateUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem('@ScoreMVP:user', JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        signIn,
        signOut,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 