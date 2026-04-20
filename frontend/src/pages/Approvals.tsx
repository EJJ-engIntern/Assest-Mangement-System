import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import LinearProgress from '@mui/material/LinearProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { getAllRequests, updateRequest } from '../api';
import { AssetRequest, RequestStatus } from '../types';
import { StatusChip } from '../components/StatusChip';

const CURRENT_MANAGER_ID = 'replace-with-manager-uuid';

const TABS: Array<RequestStatus | 'all'> = ['all', 'pending', 'approved', 'rejected', 'returned'];

export function Approvals() {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<RequestStatus | 'all'>('pending');

  const load = () => {
    getAllRequests()
      .then(setRequests)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const act = async (id: string, status: RequestStatus) => {
    await updateRequest(id, status, CURRENT_MANAGER_ID);
    load();
  };

  const visible = tab === 'all' ? requests : requests.filter((r) => r.status === tab);

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h5" mb={2}>Approvals</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        {TABS.map((t) => (
          <Tab key={t} label={t} value={t} />
        ))}
      </Tabs>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Asset</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visible.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">No requests</TableCell>
            </TableRow>
          )}
          {visible.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.employee?.name}</TableCell>
              <TableCell>{r.employee?.department}</TableCell>
              <TableCell>{r.asset?.name}</TableCell>
              <TableCell>{r.reason || '—'}</TableCell>
              <TableCell>{new Date(r.requested_at).toLocaleDateString()}</TableCell>
              <TableCell><StatusChip status={r.status} /></TableCell>
              <TableCell>
                {r.status === 'pending' && (
                  <ButtonGroup size="small">
                    <Button color="success" onClick={() => act(r.id, 'approved')}>Approve</Button>
                    <Button color="error" onClick={() => act(r.id, 'rejected')}>Reject</Button>
                  </ButtonGroup>
                )}
                {r.status === 'approved' && (
                  <Button size="small" variant="outlined" onClick={() => act(r.id, 'returned')}>
                    Mark Returned
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
