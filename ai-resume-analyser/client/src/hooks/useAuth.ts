import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  setTokens: (access: string, refresh: string) => void;
  loginWithOAuth: (accessToken: string, refreshToken: string, user: User) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      login: async (email, password) => {
        const data = await authService.login(email, password);
        set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      },

      register: async (email, password, name) => {
        const data = await authService.register(email, password, name);
        set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      },

      logout: () => set({ user: null, accessToken: null, refreshToken: null }),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      loginWithOAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user }),
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }),
    }
  )
);
