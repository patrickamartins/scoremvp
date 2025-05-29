import { createContext, useContext, ReactNode } from 'react'

interface User {
  id: number
  name: string
  email: string
  role: string
  plan: string
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

const AuthContext = createContext<AuthContextData>({
  user: null,
  isAuthenticated: true,
  isAdmin: false,
  loading: false,
  signIn: async () => {},
  signOut: () => {},
  updateUser: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: null,
        isAuthenticated: true,
        isAdmin: false,
        loading: false,
        signIn: async () => {},
        signOut: () => {},
        updateUser: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
} 