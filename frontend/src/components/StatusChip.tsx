import Chip from '@mui/material/Chip';
import { RequestStatus } from '../types';

const colorMap: Record<RequestStatus, 'warning' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  returned: 'default',
};

export function StatusChip({ status }: { status: RequestStatus }) {
  return <Chip label={status} color={colorMap[status]} size="small" />;
}
