export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Vehicle {
  _id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleFormValues {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year?: number;
  imageUrl?: string;
}

export interface SearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}
