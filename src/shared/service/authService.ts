import { supabase } from '../../config/supabase/supabase';
import type { AuthUser, AuthDto, AuthResponse } from '../models/authModel';

export const register = async (dto: AuthDto): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signUp({
    email: dto.email,
    password: dto.password,
    options: {
      emailRedirectTo: 'https://family-roots-xi.vercel.app/dashboard',
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('No se pudo crear el usuario.');

  return {
    user: { id: data.user.id, email: data.user.email ?? '' },
    access_token: data.session?.access_token ?? '',
  };
};

export const login = async (dto: AuthDto): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: dto.email,
    password: dto.password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Credenciales inválidas.');

  return {
    user: { id: data.user.id, email: data.user.email ?? '' },
    access_token: data.session.access_token,
  };
};


export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? '' };
};
