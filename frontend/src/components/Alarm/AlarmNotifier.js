import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { logAPI } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import {
  getSnoozeUntil,
  persistSnoozes,
  readStoredSnoozes,
} from '../../utils/alarmSnoozeStorage';

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function AlarmNotifier({ alarms = [], medicines = [] }) {
  const { settings } = useSettings();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', alarmId: null });
  const notifiedRef = useRef(new Set());
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
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const today = DAYS_OF_WEEK[now.getDay()];

      alarms.forEach((alarm) => {
        if (!alarm.active || !alarm.repeatDays?.includes(today)) return;

        const snoozeUntil = getSnoozeUntil(snoozed, alarm.id);
        if (snoozeUntil && snoozeUntil > Date.now()) return;

        const alarmHHMM = alarm.alarmTime?.slice(0, 5);
        if (alarmHHMM !== currentTime) return;

        const key = `${alarm.id}-${today}-${currentTime}`;
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
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [alarms, medNameById, snoozed]);

  const handleTaken = async () => {
    if (snackbar.alarmId) {
      try {
        await logAPI.log(snackbar.alarmId, 'TAKEN');
      } catch (error) {
        console.error('Failed to log TAKEN:', error);
      }
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSnooze = async () => {
    if (snackbar.alarmId) {
      const snoozeUntil = Date.now() + settings.snoozeDurationMinutes * 60000;
      setSnoozed((prev) => {
        const next = new Map(prev);
        next.set(String(snackbar.alarmId), snoozeUntil);
        return next;
      });
      try {
        await logAPI.log(snackbar.alarmId, 'SNOOZED');
      } catch (error) {
        console.error('Failed to log SNOOZED:', error);
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
