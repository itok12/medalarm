import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Snackbar, Alert, Divider, Avatar, Fade, Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import AppScreen from '../components/Layout/AppScreen';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

function ProfilePage() {
  const { user, updateUserFromProfile } = useAuth();
  const [currentPasswordForPw, setCurrentPasswordForPw] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showMsg = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      showMsg('New passwords do not match', 'error');
      return;
    }

    try {
      await userAPI.updateMe({ currentPassword: currentPasswordForPw, newPassword });
      showMsg('Password updated successfully');
      setCurrentPasswordForPw('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update password';
      showMsg(message, 'error');
    }
  };

  const handleChangeEmail = async (event) => {
    event.preventDefault();
    try {
      const response = await userAPI.updateMe({ currentPassword: currentPasswordForEmail, email: newEmail });
      updateUserFromProfile(response.data);
      showMsg('Email updated successfully');
      setCurrentPasswordForEmail('');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update email';
      showMsg(message, 'error');
    }
  };

  return (
    <AppScreen
      title="Profile"
      subtitle="Manage your account information and security settings."
      maxWidth={700}
    >
      <Fade in timeout={400}>
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: 22 }}>
                {user?.username?.[0]?.toUpperCase() || <PersonIcon />}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {user?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || 'No email set'}
                </Typography>
                <Chip label="Active Account" size="small" color="success" variant="outlined" sx={{ mt: 0.5 }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LockIcon color="primary" fontSize="small" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Change Password</Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              <Box component="form" onSubmit={handleChangePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Current Password"
                  type="password"
                  value={currentPasswordForPw}
                  onChange={(event) => setCurrentPasswordForPw(event.target.value)}
                  required
                  fullWidth
                  autoComplete="current-password"
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  fullWidth
                  autoComplete="new-password"
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  fullWidth
                  autoComplete="new-password"
                  error={confirmPassword.length > 0 && newPassword !== confirmPassword}
                  helperText={confirmPassword.length > 0 && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
                />
                <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start', minWidth: 160 }}>
                  Update Password
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EmailIcon color="primary" fontSize="small" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Change Email</Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              <Box component="form" onSubmit={handleChangeEmail} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Current Password"
                  type="password"
                  value={currentPasswordForEmail}
                  onChange={(event) => setCurrentPasswordForEmail(event.target.value)}
                  required
                  fullWidth
                  autoComplete="current-password"
                />
                <TextField
                  label="New Email"
                  type="email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
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
        onClose={() => setSnackbar((state) => ({ ...state, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((state) => ({ ...state, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppScreen>
  );
}

export default ProfilePage;
