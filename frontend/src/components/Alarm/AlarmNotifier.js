import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Snackbar, Alert } from "@mui/material";
import { logAPI } from "../../services/api";

function AlarmNotifier({ alarms = [], medicines = [] }) {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", alarmId: null });
  const notifiedRef = useRef(new Set());
  const [snoozed, setSnoozed] = useState(new Map());

  const medNameById = useMemo(() => {
    const map = new Map();
    medicines.forEach((m) => map.set(m.id, m.name));
    return map;
  }, [medicines]);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      alarms.forEach((alarm) => {
        if (!alarm.active) return;

        // Skip snoozed alarms
        const snoozeUntil = snoozed.get(alarm.id);
        if (snoozeUntil && snoozeUntil > Date.now()) return;

        // alarmTime may be "HH:mm:ss" or "HH:mm"
        const alarmHHMM = alarm.alarmTime?.slice(0, 5);
        if (alarmHHMM !== currentTime) return;

        const key = `${alarm.id}-${currentTime}`;
        if (notifiedRef.current.has(key)) return;
        notifiedRef.current.add(key);

        const medName = medNameById.get(alarm.medicineId) || "your medicine";
        const message = `Time to take: ${medName}`;

        if (Notification.permission === "granted") {
          new Notification("💊 MedAlarm", { body: message });
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
        await logAPI.log(snackbar.alarmId, "TAKEN");
      } catch (e) {
        console.error("Failed to log TAKEN:", e);
      }
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSnooze = async () => {
    if (snackbar.alarmId) {
      setSnoozed((prev) => new Map(prev).set(snackbar.alarmId, Date.now() + 600000));
      try {
        await logAPI.log(snackbar.alarmId, "SNOOZED");
      } catch (e) {
        console.error("Failed to log SNOOZED:", e);
      }
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={null}
      onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        severity="info"
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        action={
          <>
            <Button color="inherit" size="small" onClick={handleTaken}>✅ Taken</Button>
            <Button color="inherit" size="small" onClick={handleSnooze}>⏰ Snooze 10 min</Button>
          </>
        }
      >
        💊 {snackbar.message}
      </Alert>
    </Snackbar>
  );
}

export default AlarmNotifier;
