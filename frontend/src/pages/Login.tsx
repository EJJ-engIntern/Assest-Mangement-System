// import { useState } from 'react';
// import Box from '@mui/material/Box';
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import Typography from '@mui/material/Typography';
// import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';
// import Alert from '@mui/material/Alert';
// import { login } from '../api';
// import { useCurrentUser } from '../context/UserContext';

// export function Login() {
//   const { setCurrentUser } = useCurrentUser();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       setError('Email and password are required');
//       return;
//     }
//     setLoading(true);
//     setError('');
//     try {
//       const { user, token } = await login(email, password);
//       setCurrentUser(user, token);
//     } catch (e: any) {
//       setError(e.response?.data?.error || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') handleLogin();
//   };

//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         minHeight: '100vh',
//         width: '100vw',
//         bgcolor: 'grey.50',
//         position: 'fixed',
//         top: 0,
//         left: 0,
//       }}
//     >
//       <Card variant="outlined" sx={{ width: 380 }}>
//         <CardContent sx={{ p: 3 }}>
//           <Typography variant="h6" sx={{ mb: 1 }}>Asset Manager</Typography>
//           <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//             Sign in to your account
//           </Typography>

//           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//             {error && <Alert severity="error">{error}</Alert>}
//             <TextField
//               label="Email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               onKeyDown={handleKeyDown}
//               autoFocus
//             />
//             <TextField
//               label="Password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               onKeyDown={handleKeyDown}
//             />
//             <Button
//               variant="contained"
//               fullWidth
//               onClick={handleLogin}
//               disabled={loading}
//             >
//               {loading ? 'Signing in...' : 'Sign In'}
//             </Button>
//           </Box>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { login } from '../api';
import { useCurrentUser } from '../context/UserContext';

export function Login() {
  const { setCurrentUser, currentUser } = useCurrentUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Add this — shows current context value live
  console.log('Login render — currentUser:', currentUser);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await login(email, password);
      console.log('API result:', result);
      console.log('Calling setCurrentUser with:', result.user, result.token);
      setCurrentUser(result.user, result.token);
      console.log('setCurrentUser called');
      console.log('localStorage token:', localStorage.getItem('token'));
    } catch (e: any) {
      console.log('Error:', e);
      setError(e.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100vw',
        bgcolor: 'grey.50',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      <Card variant="outlined" sx={{ width: 380 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Asset Manager</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to your account
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}