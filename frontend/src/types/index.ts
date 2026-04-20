export type Role = 'employee' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
}

export interface Asset {
  id: string;
  name: string;
  category: 'hardware' | 'software';
  total_qty: number;
  available: number;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'returned';

export interface AssetRequest {
  id: string;
  employee_id: string;
  asset_id: string;
  status: RequestStatus;
  reason: string;
  requested_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  employee?: User;
  asset?: Asset;
}