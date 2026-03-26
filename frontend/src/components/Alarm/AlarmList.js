import React, { useMemo, useState } from "react";
import { alarmAPI } from "../../services/api";
import {
  Alert, Box, Divider, List, ListItem, ListItemText, Switch, Typography, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const DAY_ABBR = {
  MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu",
  FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun"
};

function formatTime(alarmTime) {
  if (!alarmTime) return "";
  // alarmTime may be "HH:mm:ss" or "HH:mm"
  const parts = alarmTime.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1] || "00";
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function AlarmList({ alarms = [], medicines = [], onChanged }) {
  const [error, setError] = useState("");

  const medNameById = useMemo(() => {
    const map = new Map();
    medicines.forEach((m) => map.set(m.id, m.name));
    return map;
  }, [medicines]);

  const handleToggle = async (alarm) => {
    setError("");
    try {
      await alarmAPI.toggle(alarm.id, !alarm.active);
      await onChanged?.();
    } catch (e) {
      console.error("Toggle failed:", e);
      setError("Failed to toggle alarm");
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await alarmAPI.delete(id);
      await onChanged?.();
    } catch (e) {
      console.error("Delete failed:", e);
      setError("Failed to delete alarm");
    }
  };

  if (!alarms.length) {
    return (
      <Typography sx={{ mt: 2 }} color="text.secondary">
        No alarms yet — create one above.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="subtitle2" sx={{ mb: 1 }} color="text.secondary">
        Saved alarms ({alarms.length})
      </Typography>

      <List dense>
        {alarms.map((a, idx) => {
          const medName = medNameById.get(a.medicineId) || `Medicine #${a.medicineId ?? "?"}`;
          const dayAbbrs = a.repeatDays
            ? [...a.repeatDays].sort().map((d) => DAY_ABBR[d] || d).join(", ")
            : "";
          return (
            <React.Fragment key={a.id}>
              <ListItem
                secondaryAction={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Switch checked={!!a.active} onChange={() => handleToggle(a)} />
                    <IconButton size="small" color="error" onClick={() => handleDelete(a.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 700 }}>{formatTime(a.alarmTime)}</Typography>}
                  secondary={
                    <>
                      <span>{medName}</span>
                      {dayAbbrs ? ` • ${dayAbbrs}` : ""}
                    </>
                  }
                />
              </ListItem>
              {idx !== alarms.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
}

export default AlarmList;
