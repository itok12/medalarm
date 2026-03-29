import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { logAPI } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import {
  getSnoozeUntil,
  persistSnoozes,
  readStoredSnoozes,
} from '../../utils/alarmSnoozeStorage';
import { isNativeMobilePlatform } from '../../services/nativePlatform';
import { scheduleSnoozedReminder } from '../../services/reminderService';
import { captureException, trackEvent } from '../../services/telemetry';
import { createAlarmDate, DAYS_OF_WEEK } from '../../utils/alarmTimeline';

function AlarmNotifier({ alarms = [], medicines = [] }) {
  const { settings } = useSettings();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', alarmId: null });
  const notifiedRef = useRef(new Set());
  const lastCheckRef = useRef(Date.now() - 60000);
  const [snoozed, setSnoozed] = useState(() => readStoredSnoozes());

  const medNameById = useMemo(() => {
    const map = new Map();
    medicines.forEach((medicine) => map.set(medicine.id, medicine.name));
    return map;
  }, [medicines]);

  useEffect(() => {
    persistSnoozes(snoozed);
  }, [snoozed]);

  useEffect(() => {
    if (isNativeMobilePlatform()) {
      return undefined;
    }

    const check = () => {
      const now = new Date();
      const today = DAYS_OF_WEEK[now.getDay()];
      const lastCheck = new Date(lastCheckRef.current);
      lastCheckRef.current = now.getTime();

      alarms.forEach((alarm) => {
        if (!alarm.active || !alarm.repeatDays?.includes(today)) return;

        const snoozeUntil = getSnoozeUntil(snoozed, alarm.id);
        if (snoozeUntil && snoozeUntil > Date.now()) return;

        const scheduledFor = createAlarmDate(now, alarm.alarmTime);
        if (scheduledFor.getTime() > now.getTime()) return;
        if (scheduledFor.getTime() < lastCheck.getTime() - 30000) return;

        const key = `${alarm.id}-${today}-${scheduledFor.toISOString()}`;
        if (notifiedRef.current.has(key)) return;
        notifiedRef.current.add(key);

        const medicineName = medNameById.get(alarm.medicineId) || 'your medicine';
        const message = `Time to take: ${medicineName}`;

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('MedAlarm Reminder', { body: message });
        }

        setSnackbar({ open: true, message, alarmId: alarm.id });
      });
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [alarms, medNameById, snoozed]);

  const handleTaken = async () => {
    if (snackbar.alarmId) {
      try {
        await logAPI.log(snackbar.alarmId, 'TAKEN');
        trackEvent('snackbar_dose_taken');
      } catch (error) {
        captureException(error, { source: 'AlarmNotifier.handleTaken' });
      }
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSnooze = async () => {
    if (snackbar.alarmId) {
      const alarm = alarms.find((entry) => entry.id === snackbar.alarmId);
      const medicineName = alarm ? medNameById.get(alarm.medicineId) : 'your medicine';
      const snoozeUntil = Date.now() + settings.snoozeDurationMinutes * 60000;
      setSnoozed((prev) => {
        const next = new Map(prev);
        next.set(String(snackbar.alarmId), snoozeUntil);
        return next;
      });
      try {
        await logAPI.log(snackbar.alarmId, 'SNOOZED');
        trackEvent('snackbar_dose_snoozed', { minutes: settings.snoozeDurationMinutes });
        if (alarm) {
          await scheduleSnoozedReminder({
            alarmId: alarm.id,
            medicineName,
            minutes: settings.snoozeDurationMinutes,
          });
        }
      } catch (error) {
        captureException(error, { source: 'AlarmNotifier.handleSnooze' });
      }
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={null}
      onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        severity="info"
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        action={(
          <>
            <Button color="inherit" size="small" onClick={handleTaken}>Taken</Button>
            <Button color="inherit" size="small" onClick={handleSnooze}>
              Snooze {settings.snoozeDurationMinutes} min
            </Button>
          </>
        )}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}

export default AlarmNotifier;
