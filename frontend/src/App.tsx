import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Dashboard } from './pages/Dashboard';
import { Requests } from './pages/Requests';
import { Approvals } from './pages/Approvals';
import { Inventory } from './pages/Inventory';
import { Users } from './pages/Users';

const DRAWER_WIDTH = 200;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/' },
  { label: 'My Requests', path: '/requests' },
  { label: 'Approvals', path: '/approvals' },
  { label: 'Inventory', path: '/inventory' },
  { label: 'Users', path: '/users' },
];

function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Box px={2} py={2}>
        <Typography variant="subtitle1" fontWeight={600}>Asset Manager</Typography>
      </Box>
      <Divider />
      <List dense>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === '/'}
            sx={{
              '&.active': { bgcolor: 'action.selected' },
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Box display="flex">
        <Sidebar />
        <Box component="main" sx={{ flex: 1, p: 3, ml: `${DRAWER_WIDTH}px` }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}