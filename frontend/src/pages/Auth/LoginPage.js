import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Alert, CircularProgress, Paper, Link, Fade,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.userId, res.data.username, res.data.refreshToken);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data || 'Login failed. Please check your credentials.');
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
      {/* Left accent panel — hidden on xs */}
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
          💊
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
          MedAlarm
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.85, textAlign: 'center', maxWidth: 280 }}>
          Never miss a dose again. Your personal medicine reminder &amp; adherence companion.
        </Typography>
      </Box>

      {/* Right form panel */}
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
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </Box>

            <Typography sx={{ mt: 2.5, textAlign: 'center' }} variant="body2">
              Don&apos;t have an account?{' '}
              <Link component={RouterLink} to="/register" sx={{ fontWeight: 700 }}>
                Create one →
              </Link>
            </Typography>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
}

export default LoginPage;
