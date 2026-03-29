import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fade,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { trackEvent } from '../../services/telemetry';
import { extractErrorMessage } from '../../utils/errorUtils';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!form.username.trim()) nextErrors.username = 'Username is required';
    if (!form.password) nextErrors.password = 'Password is required';
    else if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    return nextErrors;
  };

  const handleChange = (event) => {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
    setErrors((previous) => ({ ...previous, [event.target.name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(form);
      login(response.data);
      trackEvent('login_success');
      navigate('/');
    } catch (error) {
      setServerError(
        extractErrorMessage(error, 'Login failed. Please check your credentials.')
      );
      trackEvent('login_failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '42%',
          background: 'linear-gradient(160deg, #1565c0 0%, #0288d1 60%, #00897b 100%)',
          color: '#fff',
          p: 6,
          gap: 2,
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-1px' }}>
          MedAlarm
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
          Stay on schedule
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.85, textAlign: 'center', maxWidth: 280 }}>
          Never miss a dose again. MedAlarm keeps your medicines, reminders, and adherence history in one calm place.
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        <Fade in timeout={450}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              width: '100%',
              maxWidth: 400,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LockOutlinedIcon sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  Welcome back
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sign in to MedAlarm
                </Typography>
              </Box>
            </Box>

            {serverError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {serverError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Username"
                name="username"
                margin="normal"
                value={form.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                autoFocus
                autoComplete="username"
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                margin="normal"
                value={form.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 2.5, py: 1.4 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>

            <Typography sx={{ mt: 2.5, textAlign: 'center' }} variant="body2">
              Don&apos;t have an account?{' '}
              <Link component={RouterLink} to="/register" sx={{ fontWeight: 700 }}>
                Create one
              </Link>
            </Typography>
            <Typography
              sx={{ mt: 1.5, textAlign: 'center' }}
              variant="caption"
              color="text.secondary"
            >
              By signing in, you can review support, contact, and privacy details from the app menu at any time.
            </Typography>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
}

export default LoginPage;
