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
import { getUsers, createUser } from '../api';
import { User, Role } from '../types';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'IT', 'Operations'];

const roleColor: Record<Role, 'default' | 'primary' | 'secondary'> = {
  employee: 'default',
  manager: 'primary',
  admin: 'secondary',
};

const emptyForm = { name: '', email: '', role: 'employee' as Role, department: '' };

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingDummy, setLoadingDummy] = useState(false);
  const [dummyError, setDummyError] = useState('');

  const load = () => {
    getUsers().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.department) {
      setError('All fields are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createUser(form);
      setOpen(false);
      setForm(emptyForm);
      load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to add user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadDummy = async () => {
    setLoadingDummy(true);
    setDummyError('');
    try {
      const { data } = await axios.get('https://dummyjson.com/users?limit=10');

      // DummyJSON users have firstName, lastName, email, company.department
      const toInsert: Omit<User, 'id'>[] = data.users.map((u: any) => ({
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: 'employee' as Role,
        department: u.company?.department || 'General',
      }));

      // Insert sequentially; skip duplicates (backend returns 500 on duplicate email)
      let added = 0;
      for (const user of toInsert) {
        try {
          await createUser(user);
          added++;
        } catch {
          // silently skip duplicates
        }
      }

      load();
      if (added === 0) setDummyError('All dummy users already exist.');
    } catch (e: any) {
      setDummyError('Failed to fetch dummy users from DummyJSON.');
    } finally {
      setLoadingDummy(false);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Users</Typography>
        <ButtonGroup>
          <Button
            variant="outlined"
            onClick={handleLoadDummy}
            disabled={loadingDummy}
          >
            {loadingDummy ? 'Loading...' : 'Load Dummy Users'}
          </Button>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add User
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
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Department</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No users yet. Add one or load dummy users.
              </TableCell>
            </TableRow>
          )}
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Chip label={u.role} color={roleColor[u.role]} size="small" />
              </TableCell>
              <TableCell>{u.department}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={form.role}
                label="Role"
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={form.department}
                label="Department"
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setForm(emptyForm); setError(''); }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAdd} disabled={submitting}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}