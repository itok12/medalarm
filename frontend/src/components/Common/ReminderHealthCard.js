import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, List, ListItem, ListItemText, Typography,
} from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { getReminderHealth, openBatterySettings } from '../../services/reminderHealth';
import {
  openExactAlarmSettings,
  requestReminderPermission,
  sendTestReminder,
} from '../../services/reminderService';
import { captureException, trackEvent } from '../../services/telemetry';

function StatusRow({ label, ok, okText, problemText, help, actionLabel, onAction }) {
  return (
    <ListItem
      disableGutters
      secondaryAction={!ok && onAction ? (
        <Button size="small" variant="outlined" onClick={onAction}>{actionLabel}</Button>
      ) : null}
    >
      <ListItemText
        primary={(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
            <Chip size="small" color={ok ? 'success' : 'warning'} label={ok ? okText : problemText} />
          </Box>
        )}
        secondary={ok ? null : help}
        sx={{ pr: onAction && !ok ? 12 : 0 }}
      />
    </ListItem>
  );
}

/**
 * Shows each device setting that decides whether reminders arrive on time,
 * with a button to fix it, plus a test reminder to prove it end to end.
 */
function ReminderHealthCard() {
  const [health, setHealth] = useState(null);
  const [message, setMessage] = useState(null);

  const refresh = useCallback(() => {
    getReminderHealth()
      .then(setHealth)
      .catch((error) => captureException(error, { source: 'ReminderHealthCard.refresh' }));
  }, []);

  useEffect(() => {
    refresh();
    // Re-check after the user returns from a system settings screen.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refresh]);

  const run = (action, eventName) => async () => {
    try {
      await action();
      trackEvent(eventName);
    } catch (error) {
      captureException(error, { source: `ReminderHealthCard.${eventName}` });
    }
    refresh();
  };

  const handleTest = async () => {
    const sent = await sendTestReminder(10);
    trackEvent('test_reminder_sent', { sent });
    setMessage(sent
      ? { severity: 'info', text: 'A test reminder will arrive in about 10 seconds. You can lock the phone to check it wakes you.' }
      : { severity: 'warning', text: 'Turn on notifications first.' });
  };

  if (!health) return null;

  if (!health.native) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        On the web, reminders only appear while this tab is open. Install the Android app for alarms that
        work with the phone locked.
      </Alert>
    );
  }

  const notificationsOk = health.permission === 'granted' && health.channelEnabled;
  const allOk = notificationsOk && health.exactAlarm === 'granted' && !health.batteryOptimized;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <HealthAndSafetyIcon color={allOk ? 'success' : 'warning'} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Reminder health</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {allOk
            ? 'This phone is set up for on-time reminders.'
            : 'Fix the items below so reminders arrive on time, even with the phone locked.'}
        </Typography>

        <List dense disablePadding>
          <StatusRow
            label="Notifications"
            ok={notificationsOk}
            okText="On"
            problemText="Off"
            help="MedAlarm can't show reminders until notifications are allowed."
            actionLabel="Turn on"
            onAction={run(requestReminderPermission, 'health_notifications_enable')}
          />
          <StatusRow
            label="Exact timing"
            ok={health.exactAlarm === 'granted'}
            okText="Allowed"
            problemText="Not allowed"
            help='Without "Alarms & reminders", Android may deliver reminders late.'
            actionLabel="Allow"
            onAction={run(openExactAlarmSettings, 'health_exact_alarm_open')}
          />
          <StatusRow
            label="Battery"
            ok={!health.batteryOptimized}
            okText="Unrestricted"
            problemText="Optimized"
            help={`Battery saving can hold reminders back${health.manufacturer ? ` on this ${health.manufacturer} phone` : ''}. Choose All apps > MedAlarm > Don't optimize.`}
            actionLabel="Open"
            onAction={run(openBatterySettings, 'health_battery_open')}
          />
        </List>

        <Typography variant="body2" sx={{ mt: 1.5 }}>
          {health.next
            ? `${health.pendingCount} reminders scheduled. Next: ${health.next.title} at ${health.next.at.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}.`
            : 'No reminders are scheduled. Add a medicine with an alarm to get reminders.'}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          If you force-stop MedAlarm in Android settings, Android cancels its reminders until you open the app again.
        </Typography>

        <Button variant="contained" sx={{ mt: 2 }} onClick={handleTest}>
          Send a test reminder
        </Button>
        {message && <Alert severity={message.severity} sx={{ mt: 2 }}>{message.text}</Alert>}
      </CardContent>
    </Card>
  );
}

export default ReminderHealthCard;
