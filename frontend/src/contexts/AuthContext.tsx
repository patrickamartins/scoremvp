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
  signIn: (username: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('@ScoreMVP:token')
    const storedUser = localStorage.getItem('@ScoreMVP:user')
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (e) {
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (username: string) => {
    try {
      const response = await api.post('/auth/login', { username });
      const { token, user } = response.data;
      localStorage.setItem('@ScoreMVP:token', token);
      localStorage.setItem('@ScoreMVP:user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
    } catch (error) {
      throw new Error('Falha na autenticação');
    }
  };

  const signOut = () => {
    localStorage.removeItem('@ScoreMVP:token')
    localStorage.removeItem('@ScoreMVP:user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        signIn,
        signOut
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