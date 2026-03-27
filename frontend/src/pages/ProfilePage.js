import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Snackbar, Alert, Divider, Avatar, Fade, Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
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
      <Fade in timeout={400}>
        <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 2, sm: 3 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              👤 Profile
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Manage your account information and security settings.
            </Typography>
          </Box>

          {/* Account card */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: 22 }}>
                {user?.username?.[0]?.toUpperCase() || <PersonIcon />}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {user?.username}
                </Typography>
                <Chip label="Active Account" size="small" color="success" variant="outlined" sx={{ mt: 0.5 }} />
              </Box>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LockIcon color="primary" fontSize="small" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Change Password</Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              <Box
                component="form"
                onSubmit={handleChangePassword}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <TextField
                  label="Current Password"
                  type="password"
                  value={currentPasswordForPw}
                  onChange={(e) => setCurrentPasswordForPw(e.target.value)}
                  required
                  fullWidth
                  autoComplete="current-password"
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  fullWidth
                  autoComplete="new-password"
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                  autoComplete="new-password"
                  error={confirmPassword.length > 0 && newPassword !== confirmPassword}
                  helperText={
                    confirmPassword.length > 0 && newPassword !== confirmPassword
                      ? 'Passwords do not match'
                      : ''
                  }
                />
                <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start', minWidth: 160 }}>
                  Update Password
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Change Email */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EmailIcon color="primary" fontSize="small" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Change Email</Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              <Box
                component="form"
                onSubmit={handleChangeEmail}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <TextField
                  label="Current Password"
                  type="password"
                  value={currentPasswordForEmail}
                  onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                  required
                  fullWidth
                  autoComplete="current-password"
                />
                <TextField
                  label="New Email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  fullWidth
                  autoComplete="email"
                />
                <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start', minWidth: 160 }}>
                  Update Email
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProfilePage;
