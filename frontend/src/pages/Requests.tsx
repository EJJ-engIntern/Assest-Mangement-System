import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import { getAssets, getMyRequests, submitRequest } from '../api';
import { Asset, AssetRequest } from '../types';
import { StatusChip } from '../components/StatusChip';
import { useCurrentUser } from '../context/UserContext';

export function Requests() {
  const { currentUser } = useCurrentUser();
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [assetId, setAssetId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!currentUser) return;
    Promise.all([getMyRequests(currentUser.id), getAssets()])
      .then(([r, a]) => { setRequests(r); setAssets(a); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [currentUser]);

  const handleSubmit = async () => {
    if (!assetId) { setError('Select an asset'); return; }
    if (!currentUser) return;
    setSubmitting(true);
    setError('');
    try {
      await submitRequest({ employee_id: currentUser.id, asset_id: assetId, reason });
      setOpen(false);
      setAssetId('');
      setReason('');
      load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">My Requests</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>New Request</Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Asset</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">No requests yet</TableCell>
            </TableRow>
          )}
          {requests.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.asset?.name}</TableCell>
              <TableCell>{r.asset?.category}</TableCell>
              <TableCell>{r.reason || '—'}</TableCell>
              <TableCell><StatusChip status={r.status} /></TableCell>
              <TableCell>{new Date(r.requested_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Request Asset / Software</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}
            <FormControl fullWidth>
              <InputLabel>Asset</InputLabel>
              <Select value={assetId} label="Asset" onChange={(e) => setAssetId(e.target.value)}>
                {assets.filter((a) => a.available > 0).map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name} ({a.category}) — {a.available} available
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Reason (optional)"
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}