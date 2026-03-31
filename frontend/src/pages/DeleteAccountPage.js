import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppScreen from '../components/Layout/AppScreen';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { extractErrorMessage } from '../utils/errorUtils';
import { trackEvent } from '../services/telemetry';

function DeleteAccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginHref = useMemo(() => '/login?next=%2Fdelete-account', []);
  const registerHref = useMemo(() => '/register?next=%2Fdelete-account', []);
  const deleteReady = currentPassword.trim() && confirmation.trim().toUpperCase() === 'DELETE';

  const handleDelete = async (event) => {
    event.preventDefault();
    if (!deleteReady) {
      setError('Enter your current password and type DELETE to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await userAPI.deleteMe({ currentPassword });
      logout();
      trackEvent('account_deleted');
      navigate('/login?deleted=1', { replace: true });
    } catch (requestError) {
      setError(extractErrorMessage(requestError, 'We could not delete your account right now.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppScreen
        title="Delete account"
        subtitle="Review what is removed, then confirm the request from a signed-in session."
        maxWidth={760}
        actions={(
          <Button
            component={RouterLink}
            to={user ? '/profile' : '/login'}
            startIcon={<ArrowBackRoundedIcon />}
          >
            {user ? 'Back to profile' : 'Back to sign in'}
          </Button>
        )}
      >
        <Stack spacing={3}>
          <Card sx={{ borderColor: 'error.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <WarningAmberRoundedIcon color="error" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  This permanently deletes your MedAlarm account
                </Typography>
              </Box>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Deleting your account removes your medicines, alarms, adherence history, refresh tokens,
                and caregiver links. The request takes effect immediately and cannot be undone.
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                What happens next
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="Account removed" color="error" variant="outlined" />
                <Chip label="Medicines deleted" color="error" variant="outlined" />
                <Chip label="Alarms deleted" color="error" variant="outlined" />
                <Chip label="Adherence logs deleted" color="error" variant="outlined" />
                <Chip label="Caregiver links removed" color="error" variant="outlined" />
              </Stack>
            </CardContent>
          </Card>

          {!user ? (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Sign in to continue
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
                  Google Play requires an external account-deletion path. This page is that secure web flow.
                  Sign in with the MedAlarm account you want to remove, then confirm deletion here.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    component={RouterLink}
                    to={loginHref}
                    variant="contained"
                    startIcon={<LoginRoundedIcon />}
                  >
                    Sign in to delete account
                  </Button>
                  <Button
                    component={RouterLink}
                    to={registerHref}
                    variant="outlined"
                    startIcon={<PersonAddAltRoundedIcon />}
                  >
                    Create account
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ borderColor: 'error.light' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DeleteForeverRoundedIcon color="error" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Confirm deletion for @{user.username}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2.5 }} />
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <Box component="form" onSubmit={handleDelete} sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    label="Current password"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                    fullWidth
                  />
                  <TextField
                    label="Type DELETE to confirm"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    helperText="This helps prevent accidental deletion."
                    required
                    fullWidth
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Button
                      type="submit"
                      color="error"
                      variant="contained"
                      disabled={!deleteReady || loading}
                      startIcon={<DeleteForeverRoundedIcon />}
                    >
                      {loading ? 'Deleting account...' : 'Delete account permanently'}
                    </Button>
                    <Button
                      variant="text"
                      component={RouterLink}
                      to="/profile"
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          )}
        </Stack>
      </AppScreen>
    </Box>
  );
}

export default DeleteAccountPage;
