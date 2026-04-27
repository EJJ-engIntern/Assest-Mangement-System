import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { Dashboard } from './pages/Dashboard';
import { Requests } from './pages/Requests';
import { Approvals } from './pages/Approvals';
import { Inventory } from './pages/Inventory';
import { Users } from './pages/Users';
import { Login } from './pages/Login';
import { UserProvider, useCurrentUser } from './context/UserContext';
import { Role } from './types';

const DRAWER_WIDTH = 220;

const NAV_ITEMS: { label: string; path: string; roles: Role[] }[] = [
  { label: 'Dashboard',   path: '/',          roles: ['manager', 'admin'] },
  { label: 'My Requests', path: '/requests',  roles: ['employee', 'manager', 'admin'] },
  { label: 'Approvals',   path: '/approvals', roles: ['manager', 'admin'] },
  { label: 'Inventory',   path: '/inventory', roles: ['manager', 'admin'] },
  { label: 'Users',       path: '/users',     roles: ['admin'] },
];

const roleColor: Record<Role, 'default' | 'primary' | 'secondary'> = {
  employee: 'default',
  manager: 'primary',
  admin: 'secondary',
};

function getDefaultPath(role: Role): string {
  return role === 'employee' ? '/requests' : '/';
}

function Sidebar() {
  const { currentUser, setCurrentUser } = useCurrentUser();
  if (!currentUser) return null;

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(currentUser.role));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Asset Manager</Typography>
      </Box>
      <Divider />
      <List dense sx={{ flex: 1 }}>
        {visibleNav.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === '/'}
            sx={{ '&.active': { bgcolor: 'action.selected' } }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" noWrap>{currentUser.name}</Typography>
          <Chip label={currentUser.role} color={roleColor[currentUser.role]} size="small" />
        </Box>
        <Button size="small" variant="outlined" onClick={() => setCurrentUser(null)}>
          Sign Out
        </Button>
      </Box>
    </Drawer>
  );
}

function Guard({ roles, children }: { roles: Role[]; children: JSX.Element }) {
  const { currentUser } = useCurrentUser();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!roles.includes(currentUser.role)) return <Navigate to={getDefaultPath(currentUser.role)} replace />;
  return children;
}

function AppRoutes() {
  const { currentUser } = useCurrentUser();

  return (
    <>
      {currentUser && <Sidebar />}
      <Box
        component="main"
        sx={{
          flex: 1,
          p: currentUser ? 3 : 0,
          ml: currentUser ? `${DRAWER_WIDTH}px` : 0,
        }}
      >
        <Routes>
          <Route
            path="/login"
            element={currentUser ? <Navigate to={getDefaultPath(currentUser.role)} replace /> : <Login />}
          />
          <Route path="/" element={
            <Guard roles={['manager', 'admin']}><Dashboard /></Guard>
          } />
          <Route path="/requests" element={
            <Guard roles={['employee', 'manager', 'admin']}><Requests /></Guard>
          } />
          <Route path="/approvals" element={
            <Guard roles={['manager', 'admin']}><Approvals /></Guard>
          } />
          <Route path="/inventory" element={
            <Guard roles={['manager', 'admin']}><Inventory /></Guard>
          } />
          <Route path="/users" element={
            <Guard roles={['admin']}><Users /></Guard>
          } />
          <Route
            path="*"
            element={<Navigate to={currentUser ? getDefaultPath(currentUser.role) : '/login'} replace />}
          />
        </Routes>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Box sx={{ display: 'flex' }}>
          <AppRoutes />
        </Box>
      </BrowserRouter>
    </UserProvider>
  );
}