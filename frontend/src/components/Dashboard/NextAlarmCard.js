import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import AlarmIcon from "@mui/icons-material/Alarm";
import EventBusyIcon from "@mui/icons-material/EventBusy";

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
        <CardContent sx={{ textAlign: "center", py: 3 }}>
          <EventBusyIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>No Upcoming Alarms</Typography>
          <Typography color="text.secondary" variant="body2">
            Add medicines and create alarms to get started.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const medName = medNameById.get(next.medicineId) || "Medicine";
  const time12h = formatTime12h(next.alarmTime);
  const countdown = getCountdown(next.alarmTime);

  return (
    <Card
      sx={{
        mt: 2,
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0d3b6e 0%, #0a4e6e 100%)"
            : "linear-gradient(135deg, #e3f2fd 0%, #e0f7fa 100%)",
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            bgcolor: "primary.main",
            borderRadius: "50%",
            p: 1.5,
            display: "flex",
            flexShrink: 0,
          }}
        >
          <AlarmIcon sx={{ color: "#fff", fontSize: 28 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
            Next Alarm
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1.1 }}>
            {time12h}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {medName}
          </Typography>
        </Box>
        <Chip
          label={countdown}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ fontWeight: 700 }}
        />
      </CardContent>
    </Card>
  );
}

export default NextAlarmCard;
