import { apiClient } from './client';
import type { AuthResponse, Role } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/register', payload);
  return data;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/login', payload);
  return data;
}
