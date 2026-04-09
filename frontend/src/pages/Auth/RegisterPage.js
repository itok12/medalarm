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
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { trackEvent } from '../../services/telemetry';
import { extractErrorMessage } from '../../utils/errorUtils';

function resolveNextPath(search) {
  const next = new URLSearchParams(search).get('next');
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/';
  }
  return next;
}

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const nextPath = resolveNextPath(location.search);

  const validate = () => {
    const nextErrors = {};
    if (!form.username.trim()) nextErrors.username = 'Username is required';
    else if (form.username.length < 3) nextErrors.username = 'Username must be at least 3 characters';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = 'Invalid email address';
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
      const response = await authAPI.register({
        ...form,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      login(response.data);
      trackEvent('register_success');
      navigate(nextPath, { replace: true });
    } catch (error) {
      setServerError(
        extractErrorMessage(error, 'Registration failed. Please try again.')
      );
      trackEvent('register_failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
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
          background: 'linear-gradient(160deg, #00897b 0%, #0288d1 60%, #1565c0 100%)',
          color: '#fff',
          p: 6,
          gap: 2,
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-1px' }}>
          MedAlarm
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
          Start strong
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.85, textAlign: 'center', maxWidth: 280 }}>
          Create your account and we will walk you through reminders, defaults, and your first medicine.
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 1.5, sm: 4 },
        }}
      >
        <Fade in timeout={450}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.25, sm: 4 },
              width: '100%',
              maxWidth: { xs: '100%', sm: 420 },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: { xs: 4, sm: 6 },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  bgcolor: 'secondary.main',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonAddOutlinedIcon sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  Create your account
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Get started with MedAlarm for free
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
                label="Email"
                name="email"
                type="email"
                margin="normal"
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
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
                helperText={errors.password || 'Minimum 6 characters'}
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                sx={{ mt: 2.5, py: 1.4 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </Box>

            <Typography sx={{ mt: 2.5, textAlign: 'center' }} variant="body2">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to={nextPath === '/' ? '/login' : `/login?next=${encodeURIComponent(nextPath)}`}
                sx={{ fontWeight: 700 }}
              >
                Sign in
              </Link>
            </Typography>
            <Typography
              sx={{ mt: 1.5, textAlign: 'center' }}
              variant="caption"
              color="text.secondary"
            >
              After signup, MedAlarm walks you through reminders, defaults, and your first medicine.
            </Typography>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
}

export default RegisterPage;
