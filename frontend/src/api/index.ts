import axios from 'axios';
import { Asset, AssetRequest, User } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// Assets
export const getAssets = () =>
  api.get<Asset[]>('/api/assets').then((r) => r.data);

export const createAsset = (body: Pick<Asset, 'name' | 'category' | 'total_qty'>) =>
  api.post<Asset>('/api/assets', body).then((r) => r.data);

// Requests
export const getAllRequests = () =>
  api.get<AssetRequest[]>('/api/requests').then((r) => r.data);

export const getMyRequests = (employee_id: string) =>
  api.get<AssetRequest[]>('/api/requests/mine', { params: { employee_id } }).then((r) => r.data);

export const submitRequest = (body: { employee_id: string; asset_id: string; reason: string }) =>
  api.post<AssetRequest>('/api/requests', body).then((r) => r.data);

export const updateRequest = (id: string, status: string, resolved_by: string) =>
  api.patch<AssetRequest>(`/api/requests/${id}`, { status, resolved_by }).then((r) => r.data);

// Users
export const getUsers = () =>
  api.get<User[]>('/api/users').then((r) => r.data);

export const createUser = (body: Omit<User, 'id'>) =>
  api.post<User>('/api/users', body).then((r) => r.data);

export const clearAssets = () =>
  api.delete('/api/assets/all').then((r) => r.data);