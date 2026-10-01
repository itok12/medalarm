import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useMedData } from '../../context/MedDataContext';
import { importAPI } from '../../services/api';
import { clearGuestStore, getGuestSnapshot } from '../../services/guestDataService';
import { buildGuestImportPayload, hasGuestData } from '../../utils/guestImport';
import { captureException, trackEvent } from '../../services/telemetry';

// Shown after signing in when this device still holds data from guest mode.
// The device copy is only cleared once the server has accepted all of it.
function GuestImportDialog() {
  const { user } = useAuth();
  const { refreshAll } = useMedData();
  const [snapshot, setSnapshot] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const signedIn = !!user && !user.guest && !user.sessionExpired;

  useEffect(() => {
    let ignore = false;
    if (!signedIn) {
      setSnapshot(null);
      return undefined;
    }
    getGuestSnapshot()
      .then((store) => {
        if (!ignore) setSnapshot(hasGuestData(store) ? store : null);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, [signedIn, user?.userId]);

  if (!snapshot || dismissed) {
    return null;
  }

  const medicineCount = snapshot.medicines.length;
  const logCount = snapshot.logs?.length ?? 0;

  const handleImport = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await importAPI.guest(buildGuestImportPayload(snapshot));
      await clearGuestStore();
      trackEvent('guest_data_imported', data);
      setSnapshot(null);
      await refreshAll({ background: true });
    } catch (importError) {
      captureException(importError, { source: 'GuestImportDialog.import' });
      setError('Could not move your data right now. It is still saved on this device; try again later.');
    } finally {
      setBusy(false);
    }
  };

  const handleDiscard = async () => {
    await clearGuestStore();
    trackEvent('guest_data_discarded');
    setSnapshot(null);
  };

  return (
    <Dialog open fullWidth maxWidth="xs">
      <DialogTitle>Add your saved medicines to your account?</DialogTitle>
      <DialogContent>
        {confirmDiscard ? (
          <DialogContentText>
            Delete the {medicineCount} medicine{medicineCount === 1 ? '' : 's'} and dose history saved on this
            device? This cannot be undone.
          </DialogContentText>
        ) : (
          <DialogContentText>
            This device has {medicineCount} medicine{medicineCount === 1 ? '' : 's'}
            {logCount > 0 ? ` and ${logCount} logged dose${logCount === 1 ? '' : 's'}` : ''} from before you
            signed in. Add them to your account so they sync and keep their reminders.
          </DialogContentText>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        {confirmDiscard ? (
          <>
            <Button onClick={() => setConfirmDiscard(false)}>Back</Button>
            <Button color="error" onClick={handleDiscard}>Delete</Button>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => setConfirmDiscard(true)} disabled={busy}>
              Delete
            </Button>
            <Button onClick={() => setDismissed(true)} disabled={busy}>Not now</Button>
            <Button variant="contained" onClick={handleImport} disabled={busy}>
              {busy ? 'Adding…' : 'Add to account'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default GuestImportDialog;
