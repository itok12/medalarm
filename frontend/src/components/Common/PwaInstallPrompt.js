import React, { useEffect, useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';

/**
 * Shows a "Install App" banner when the browser's beforeinstallprompt event fires.
 * This works in Chrome/Edge on Android and desktop.
 */
function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setOpen(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      onClose={handleClose}
    >
      <Alert
        severity="info"
        icon={<InstallMobileIcon />}
        onClose={handleClose}
        action={
          <Button color="inherit" size="small" onClick={handleInstall}>
            Install
          </Button>
        }
      >
        Add MedAlarm to your home screen for the best experience.
      </Alert>
    </Snackbar>
  );
}

export default PwaInstallPrompt;
