import { create } from 'zustand';
import { authService } from '../service/authService';
import type { AuthUser, AuthDto } from '../models/authModel';

interface AuthStore {
  user: AuthUser | null;
  access_token: string | null;
  loading: boolean;
  error: string | null;

  register: (dto: AuthDto) => Promise<void>;
  login: (dto: AuthDto) => Promise<void>;
  getCurrentUser: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user:         null,
  access_token: null,
  loading:      false,
  error:        null,

  register: async (dto) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(dto);
      set({ user: response.user, access_token: response.access_token, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  login: async (dto) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(dto);
      set({ user: response.user, access_token: response.access_token, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  getCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const user = await authService.getCurrentUser();
      set({ user, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  logout: () => {
    set({ user: null, access_token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
