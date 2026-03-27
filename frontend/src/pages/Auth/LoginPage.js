import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Alert, CircularProgress, Paper, Link
} from '@mui/material';
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
      login(res.data.token, res.data.userId, res.data.username);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
          💊 MedAlarm — Sign In
        </Typography>

        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Username" name="username" margin="normal"
            value={form.username} onChange={handleChange}
            error={!!errors.username} helperText={errors.username}
          />
          <TextField
            fullWidth label="Password" name="password" type="password" margin="normal"
            value={form.password} onChange={handleChange}
            error={!!errors.password} helperText={errors.password}
          />
          <Button
            type="submit" variant="contained" fullWidth sx={{ mt: 2 }}
            disabled={loading} startIcon={loading ? <CircularProgress size={18} /> : null}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </Box>

        <Typography sx={{ mt: 2, textAlign: 'center' }} variant="body2">
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register">Register here</Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default LoginPage;
