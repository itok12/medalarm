import React from 'react';
import { Alert, Button } from '@mui/material';

function ReminderPermissionCard({ status, onEnable }) {
  if (status === 'granted') {
    return null;
  }

  if (status === 'unsupported') {
    return (
      <Alert severity="warning">
        Notifications are not supported on this device. MedAlarm will still track medicines and logs.
      </Alert>
    );
  }

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

export default ReminderPermissionCard;
