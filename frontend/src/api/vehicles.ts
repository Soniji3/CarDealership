import { apiClient } from './client';
import type { SearchFilters, Vehicle, VehicleFormValues } from '../types';

export async function fetchVehicles(): Promise<Vehicle[]> {
  const { data } = await apiClient.get<Vehicle[]>('/api/vehicles');
  return data;
}

export async function searchVehicles(filters: SearchFilters): Promise<Vehicle[]> {
  const params: Record<string, string | number> = {};
  if (filters.make) params.make = filters.make;
  if (filters.model) params.model = filters.model;
  if (filters.category) params.category = filters.category;
  if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
  if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;

  const { data } = await apiClient.get<Vehicle[]>('/api/vehicles/search', { params });
  return data;
}

export async function createVehicle(payload: VehicleFormValues): Promise<Vehicle> {
  const { data } = await apiClient.post<Vehicle>('/api/vehicles', payload);
  return data;
}

export async function updateVehicle(
  id: string,
  payload: Partial<VehicleFormValues>,
): Promise<Vehicle> {
  const { data } = await apiClient.put<Vehicle>(`/api/vehicles/${id}`, payload);
  return data;
}

export async function deleteVehicle(id: string): Promise<void> {
  await apiClient.delete(`/api/vehicles/${id}`);
}

export async function purchaseVehicle(id: string): Promise<Vehicle> {
  const { data } = await apiClient.post<Vehicle>(`/api/vehicles/${id}/purchase`);
  return data;
}

export async function restockVehicle(id: string, amount: number): Promise<Vehicle> {
  const { data } = await apiClient.post<Vehicle>(`/api/vehicles/${id}/restock`, { amount });
  return data;
}
