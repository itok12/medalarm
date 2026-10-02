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
import { cancelNudgesForAlarm, scheduleSnoozedReminder } from '../../services/reminderService';
import { captureException, trackEvent } from '../../services/telemetry';
import { createAlarmDate, DAYS_OF_WEEK } from '../../utils/alarmTimeline';

// Play a short attention tone using Web Audio API
function playAlarmTone() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);
  } catch {
    // Audio not available — skip silently
  }
}

// How long before re-showing a dismissed but unacknowledged alarm (ms)
const REPROMPT_MS = 15 * 60 * 1000;

function AlarmNotifier({ alarms = [], medicines = [] }) {
  const { settings } = useSettings();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', alarmId: null });
  const notifiedRef = useRef(new Set());      // keys shown at least once
  const acknowledgedRef = useRef(new Set());  // keys TAKEN or SNOOZED — no reprompt
  const shownAtRef = useRef(new Map());       // key → timestamp of last show
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

    const showAlarm = (key, alarmId, medicineName) => {
      const message = `Time to take: ${medicineName}`;
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('MedAlarm Reminder', { body: message });
      }
      playAlarmTone();
      shownAtRef.current.set(key, Date.now());
      setSnackbar({ open: true, message, alarmId });
    };

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
        const medicineName = medNameById.get(alarm.medicineId) || 'your medicine';

        if (!notifiedRef.current.has(key)) {
          notifiedRef.current.add(key);
          showAlarm(key, alarm.id, medicineName);
          return;
        }

        // Reprompt: re-show if dismissed without action and > REPROMPT_MS ago
        if (!acknowledgedRef.current.has(key)) {
          const shownAt = shownAtRef.current.get(key) || 0;
          if (Date.now() - shownAt >= REPROMPT_MS) {
            showAlarm(key, alarm.id, medicineName);
          }
        }
      });
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [alarms, medNameById, snoozed]);

  const markAcknowledged = (key) => {
    if (key) acknowledgedRef.current.add(key);
  };

  const currentKey = snackbar.alarmId
    ? [...shownAtRef.current.keys()].find((k) => k.startsWith(`${snackbar.alarmId}-`))
    : null;

  const handleTaken = async () => {
    if (snackbar.alarmId) {
      markAcknowledged(currentKey);
      try {
        await logAPI.log(snackbar.alarmId, 'TAKEN');
        await cancelNudgesForAlarm(snackbar.alarmId);
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
      markAcknowledged(currentKey);
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
