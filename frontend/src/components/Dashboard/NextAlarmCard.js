import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import AlarmIcon from "@mui/icons-material/Alarm";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import { findNextAlarm, formatTime12h, getCountdown } from "../../utils/alarmTimeline";

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
  const countdown = next?.scheduledFor
    ? getCountdown(next.scheduledFor.toTimeString().slice(0, 5), new Date())
    : getCountdown(next.alarmTime);

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
