import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { getAssets, getAllRequests } from '../api';
import { Asset, AssetRequest } from '../types';

export function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAssets(), getAllRequests()])
      .then(([a, r]) => { setAssets(a); setRequests(r); })
      .finally(() => setLoading(false));
  }, []);

  const pending = requests.filter((r) => r.status === 'pending').length;
  const approved = requests.filter((r) => r.status === 'approved').length;
  const totalAssets = assets.reduce((s, a) => s + a.total_qty, 0);
  const totalAvailable = assets.reduce((s, a) => s + a.available, 0);

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Dashboard</Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Total Assets', value: totalAssets },
          { label: 'Available', value: totalAvailable },
          { label: 'In Use', value: totalAssets - totalAvailable },
          { label: 'Pending Requests', value: pending },
          { label: 'Active Allocations', value: approved },
        ].map((stat) => (
          <Grid
            key={stat.label}
            sx={{
              display: 'flex',
              width: { xs: '50%', sm: '33.33%', md: '20%' },
              p: 1,
            }}
          >
            <Card variant="outlined" sx={{ width: '100%' }}>
              <CardContent>
                <Typography variant="h4">{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>Inventory Overview</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Asset</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Available</TableCell>
            <TableCell>In Use</TableCell>
            <TableCell>Utilization</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map((a) => {
            const used = a.total_qty - a.available;
            const pct = a.total_qty > 0 ? Math.round((used / a.total_qty) * 100) : 0;
            return (
              <TableRow key={a.id}>
                <TableCell>{a.name}</TableCell>
                <TableCell>{a.category}</TableCell>
                <TableCell>{a.total_qty}</TableCell>
                <TableCell>{a.available}</TableCell>
                <TableCell>{used}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{ width: 80, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption">{pct}%</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
