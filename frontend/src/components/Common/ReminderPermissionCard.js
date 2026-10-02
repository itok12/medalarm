import React from 'react';
import { Alert, Button } from '@mui/material';

function ReminderPermissionCard({ status, exactStatus = 'granted', onEnable, onAllowExact }) {
  if (status === 'unsupported') {
    return (
      <Alert severity="warning">
        Notifications are not supported on this device. MedAlarm will still track medicines and logs.
      </Alert>
    );
  }

  if (status !== 'granted') {
    return (
      <Alert
        severity="info"
        action={(
          <Button color="inherit" size="small" onClick={onEnable}>
            Enable
          </Button>
        )}
      >
        Turn on reminders so MedAlarm can notify you when it is time to take a dose.
      </Alert>
    );
  }

  if (exactStatus === 'denied') {
    return (
      <Alert
        severity="warning"
        action={(
          <Button color="inherit" size="small" onClick={onAllowExact}>
            Allow
          </Button>
        )}
      >
        Reminders may arrive late. Allow &quot;Alarms &amp; reminders&quot; so each dose alert fires on time.
      </Alert>
    );
  }

  return null;
}

export default ReminderPermissionCard;
