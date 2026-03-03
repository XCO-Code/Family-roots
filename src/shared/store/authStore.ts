import { create } from 'zustand';
import { register, login, getCurrentUser } from '../service/authService';
import type { AuthUser, AuthDto } from '../models/authModel';
import { supabase } from '../../config/supabase/supabase';

interface AuthStore {
  user: AuthUser | null;
  access_token: string | null;
  loading: boolean;
  error: string | null;

  register: (dto: AuthDto) => Promise<void>;
  login: (dto: AuthDto) => Promise<void>;
  getCurrentUser: () => Promise<void>;
  setUser: (user: AuthUser, access_token: string) => void;
  logout: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  access_token: null,
  loading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  register: async (dto) => {
    set({ loading: true, error: null });
    try {
      const response = await register(dto);
      // Si hay sesión inmediata la guardamos; si no, el usuario debe confirmar email
      if (response.access_token) {
        set({ user: response.user, access_token: response.access_token, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  login: async (dto) => {
    set({ loading: true, error: null });
    try {
      const response = await login(dto);
      set({ user: response.user, access_token: response.access_token, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  getCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const user = await getCurrentUser();
      set({ user, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setUser: (user, access_token) => {
    set({ user, access_token });
  },

  logout: () => {
    supabase.auth.signOut();
    set({ user: null, access_token: null, error: null });
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));