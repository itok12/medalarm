import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Snackbar, Alert, Divider
} from '@mui/material';
import Navbar from '../components/Layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.userId;

  const [currentPasswordForPw, setCurrentPasswordForPw] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showMsg = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMsg('New passwords do not match', 'error');
      return;
    }
    try {
      await userAPI.updateProfile(userId, { currentPassword: currentPasswordForPw, newPassword });
      showMsg('Password updated successfully');
      setCurrentPasswordForPw('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update password';
      showMsg(msg, 'error');
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateProfile(userId, { currentPassword: currentPasswordForEmail, email: newEmail });
      showMsg('Email updated successfully');
      setNewEmail('');
      setCurrentPasswordForEmail('');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update email';
      showMsg(msg, 'error');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Profile
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" color="text.secondary">Username</Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>{user?.username}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Change Password</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box component="form" onSubmit={handleChangePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Current Password"
                type="password"
                value={currentPasswordForPw}
                onChange={(e) => setCurrentPasswordForPw(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
                error={confirmPassword.length > 0 && newPassword !== confirmPassword}
                helperText={confirmPassword.length > 0 && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
              />
              <Button type="submit" variant="contained">Update Password</Button>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Change Email</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box component="form" onSubmit={handleChangeEmail} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Current Password"
                type="password"
                value={currentPasswordForEmail}
                onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="New Email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained">Update Email</Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProfilePage;
