import React, { useEffect, useMemo, useRef, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

function AlarmNotifier({ alarms = [], medicines = [] }) {
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const notifiedRef = useRef(new Set());

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

        setSnackbar({ open: true, message });
      });
    };

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [alarms, medNameById]);

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={10000}
      onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity="info" onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
        💊 {snackbar.message}
      </Alert>
    </Snackbar>
  );
}

export default AlarmNotifier;
