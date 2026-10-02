import React, { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { captureException, trackEvent } from '../../services/telemetry';
import { HealthDataConsentText } from '../Common/HealthDataConsent';

// Accounts created before consent was asked at sign-up have no consent on record.
// Ask once; declining signs out (the app keeps working in on-device guest mode).
function HealthDataConsentDialog() {
  const { user, logout, updateUserFromProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const needsConsent = !!user && !user.guest && !user.sessionExpired && !user.healthDataConsentAt;
  if (!needsConsent) {
    return null;
  }

  const handleAgree = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await userAPI.giveHealthDataConsent();
      updateUserFromProfile(data);
      trackEvent('health_data_consent_given');
    } catch (consentError) {
      captureException(consentError, { source: 'HealthDataConsentDialog.agree' });
      setError('Could not save your choice. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDecline = () => {
    trackEvent('health_data_consent_declined');
    logout();
  };

  return (
    <Dialog open fullWidth maxWidth="xs">
      <DialogTitle>Your health data</DialogTitle>
      <DialogContent>
        <HealthDataConsentText />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleDecline} disabled={busy}>Sign out</Button>
        <Button variant="contained" onClick={handleAgree} disabled={busy}>I agree</Button>
      </DialogActions>
    </Dialog>
  );
}

export default HealthDataConsentDialog;
