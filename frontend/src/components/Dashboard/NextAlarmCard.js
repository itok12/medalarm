import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";

const DAYS_OF_WEEK = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function formatTime12h(alarmTime) {
  if (!alarmTime) return "";
  const parts = alarmTime.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1] || "00";
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function getCountdown(alarmTime) {
  if (!alarmTime) return "";
  const now = new Date();
  const parts = alarmTime.split(":");
  const alarmHour = parseInt(parts[0], 10);
  const alarmMinute = parseInt(parts[1], 10);

  const alarmDate = new Date();
  alarmDate.setHours(alarmHour, alarmMinute, 0, 0);

  let diff = alarmDate - now;
  if (diff < 0) {
    alarmDate.setDate(alarmDate.getDate() + 1);
    diff = alarmDate - now;
  }

  const totalMinutes = Math.round(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}

function findNextAlarm(alarms) {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const todayName = DAYS_OF_WEEK[now.getDay()];
  const tomorrowName = DAYS_OF_WEEK[(now.getDay() + 1) % 7];

  const active = alarms.filter((a) => a.active && a.repeatDays);

  // Find next alarm today (after current time)
  const todayAlarms = active
    .filter((a) => a.repeatDays.includes(todayName) && (a.alarmTime?.slice(0, 5) || "") > currentTime)
    .sort((a, b) => (a.alarmTime > b.alarmTime ? 1 : -1));

  if (todayAlarms.length > 0) return todayAlarms[0];

  // Check tomorrow
  const tomorrowAlarms = active
    .filter((a) => a.repeatDays.includes(tomorrowName))
    .sort((a, b) => (a.alarmTime > b.alarmTime ? 1 : -1));

  return tomorrowAlarms[0] || null;
}

function NextAlarmCard({ alarms = [], medNameById = new Map() }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const next = findNextAlarm(alarms);

  if (!next) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>⏰ Next Alarm</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>No upcoming alarms scheduled.</Typography>
        </CardContent>
      </Card>
    );
  }

  const medName = medNameById.get(next.medicineId) || "Medicine";
  const time12h = formatTime12h(next.alarmTime);
  const countdown = getCountdown(next.alarmTime);

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>⏰ Next Alarm</Typography>
        <Typography variant="h5" sx={{ mt: 1, fontWeight: 700, color: "primary.main" }}>
          {time12h}
        </Typography>
        <Typography variant="body1">{medName}</Typography>
        <Typography variant="body2" color="text.secondary">{countdown}</Typography>
      </CardContent>
    </Card>
  );
}

export default NextAlarmCard;
