export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
}
