import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  token: string;
  role: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set: (fn: (state: AuthState) => Partial<AuthState>) => void) => ({
  user: null,
  setUser: (user: User | null) => set(() => ({ user })),
  logout: () => set(() => ({ user: null })),
})); 