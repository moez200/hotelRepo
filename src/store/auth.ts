import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';

interface AuthState {
  first_name: string | null,
  user: User | null;
  role: string | null;
  accessToken: string; // Assurez-vous que le type est toujours 'string', pas 'string | null'
  refreshToken: string; // Assurez-vous que le type est toujours 'string', pas 'string | null'
  setUser: (user: User | null , role: string | null , username: string ) => void;
  setTokens: (tokens: { access: string; refresh: string }) => void;
  logout: () => void;
}

export const getAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null, 
      first_name: null,
      accessToken: '', // Initialisez comme une chaîne vide
      refreshToken: '', // Initialisez comme une chaîne vide
     setUser: (user, role,first_name) => set({ user, role,first_name }),
      setTokens: (tokens) => set({ 
        accessToken: tokens.access,  // Ce sera une chaîne
        refreshToken: tokens.refresh,  // Ce sera une chaîne
      }),
      logout: () => set({ 
        user: null, 
        first_name:  null,
        role: null,
        accessToken: '',  // Réinitialisez à une chaîne vide
        refreshToken: '',  // Réinitialisez à une chaîne vide
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
