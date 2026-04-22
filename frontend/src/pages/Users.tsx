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
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import { getUsers, createUser, clearUsers, clearUser } from '../api';
import { User, Role } from '../types';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'IT', 'Operations'];

const roleColor: Record<Role, 'default' | 'primary' | 'secondary'> = {
  employee: 'default',
  manager: 'primary',
  admin: 'secondary',
};

const emptyForm = { name: '', email: '', role: 'employee' as Role, department: '', password: '' };

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');

  const load = () => {
    getUsers().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.department || !form.password) {
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

  const handleDelete = async (id: string) => {
    try {
      await clearUser(id);
      load();
    } catch {
      setPageError('Failed to delete user.');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearUsers();
      setConfirmClearOpen(false);
      load();
    } catch {
      setPageError('Failed to clear users.');
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Users</Typography>
        <ButtonGroup>
          <Button variant="outlined" color="error" onClick={() => setConfirmClearOpen(true)}>
            Clear All
          </Button>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add User
          </Button>
        </ButtonGroup>
      </Box>

      {pageError && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setPageError('')}>
          {pageError}
        </Alert>
      )}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Department</TableCell>
            <TableCell align="center">Delete</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No users yet. Add one to get started.
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
              <TableCell align="center">
                <IconButton size="small" color="error" onClick={() => handleDelete(u.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add User Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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

      {/* Clear All Confirm Dialog */}
      <Dialog open={confirmClearOpen} onClose={() => setConfirmClearOpen(false)}>
        <DialogTitle>Clear All Users?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently delete all users.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleClearAll}>
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}