import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
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
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import { getAssets, createAsset, clearAssets } from '../api';
import { Asset } from '../types';

const SOFTWARE_ASSETS = [
  'Microsoft 365 License',
  'Adobe Creative Cloud',
  'GitHub Copilot',
  'Slack Pro Seat',
  'Zoom Pro License',
  'Figma Seat',
  'Jira License',
  'Antivirus License',
];

const HARDWARE_CATEGORIES = [
  { slug: 'laptops', label: 'hardware' },
  { slug: 'smartphones', label: 'hardware' },
  { slug: 'tablets', label: 'hardware' },
  { slug: 'mobile-accessories', label: 'hardware' },
];

export function Inventory() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'hardware' | 'software'>('hardware');
  const [qty, setQty] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingDummy, setLoadingDummy] = useState(false);
  const [dummyError, setDummyError] = useState('');

  const load = () => {
    getAssets().then(setAssets).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async () => {
    if (!name || !qty) { setError('Name and quantity are required'); return; }
    setSubmitting(true);
    setError('');
    try {
      await createAsset({ name, category, total_qty: Number(qty) });
      setOpen(false);
      setName('');
      setQty('');
      load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to add asset');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadDummy = async () => {
    setLoadingDummy(true);
    setDummyError('');
    try {
      let added = 0;

      for (const { slug, label } of HARDWARE_CATEGORIES) {
        const { data } = await axios.get(`https://dummyjson.com/products/category/${slug}`);
        for (const p of data.products) {
          try {
            await createAsset({
              name: p.title,
              category: label as 'hardware',
              total_qty: Math.floor(Math.random() * 15) + 5,
            });
            added++;
          } catch {
            // skip duplicates
          }
        }
      }

      for (const assetName of SOFTWARE_ASSETS) {
        try {
          await createAsset({
            name: assetName,
            category: 'software',
            total_qty: Math.floor(Math.random() * 30) + 10,
          });
          added++;
        } catch {
          // skip duplicates
        }
      }

      load();
      if (added === 0) setDummyError('All dummy assets already exist.');
    } catch {
      setDummyError('Failed to load dummy assets.');
    } finally {
      setLoadingDummy(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearAssets();
      setConfirmOpen(false);
      load();
    } catch {
      setDummyError('Failed to clear assets.');
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Inventory</Typography>
        <ButtonGroup>
          <Button variant="outlined" color="error" onClick={() => setConfirmOpen(true)}>
            Clear All
          </Button>
          <Button variant="outlined" onClick={handleLoadDummy} disabled={loadingDummy}>
            {loadingDummy ? 'Loading...' : 'Load Dummy Assets'}
          </Button>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add Asset
          </Button>
        </ButtonGroup>
      </Box>

      {dummyError && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setDummyError('')}>
          {dummyError}
        </Alert>
      )}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Available</TableCell>
            <TableCell>In Use</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No assets yet. Add one or load dummy assets.
              </TableCell>
            </TableRow>
          )}
          {assets.map((a) => (
            <TableRow key={a.id}>
              <TableCell>{a.name}</TableCell>
              <TableCell>
                <Chip label={a.category} size="small" variant="outlined" />
              </TableCell>
              <TableCell>{a.total_qty}</TableCell>
              <TableCell>{a.available}</TableCell>
              <TableCell>{a.total_qty - a.available}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Asset Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Asset</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Asset Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value as 'hardware' | 'software')}
              >
                <MenuItem value="hardware">Hardware</MenuItem>
                <MenuItem value="software">Software</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Total Quantity"
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} disabled={submitting}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Clear All Assets?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently delete all assets from the inventory.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleClear}>
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}