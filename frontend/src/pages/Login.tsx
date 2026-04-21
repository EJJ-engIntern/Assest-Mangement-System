import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import { getUsers } from '../api';
import { User, Role } from '../types';
import { useCurrentUser } from '../context/UserContext';

const roleColor: Record<Role, 'default' | 'primary' | 'secondary'> = {
  employee: 'default',
  manager: 'primary',
  admin: 'secondary',
};

export function Login() {
  const { setCurrentUser } = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const handleLogin = () => {
    const user = users.find((u) => u.id === selectedId);
    if (user) setCurrentUser(user);
  };

  if (loading) return <LinearProgress />;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="grey.50"
    >
      <Card variant="outlined" sx={{ width: 380 }}>
        <CardContent>
          <Typography variant="h6" mb={1}>Asset Manager</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Select your account to continue
          </Typography>

          {users.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No users found. Go to the Users page and add some first.
            </Typography>
          ) : (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={selectedId}
                  label="Select User"
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span>{u.name}</span>
                        <Chip label={u.role} color={roleColor[u.role]} size="small" />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                fullWidth
                disabled={!selectedId}
                onClick={handleLogin}
              >
                Continue
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}