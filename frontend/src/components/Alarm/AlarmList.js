import React, { useMemo, useState } from "react";
import { alarmAPI, logAPI } from "../../services/api";
import {
  Alert, Box, Button, Divider, List, ListItem, ListItemText, Snackbar, Switch, Typography, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const DAY_ORDER = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
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
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

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

  const handleLog = async (alarmId, status) => {
    setError("");
    try {
      await logAPI.log(alarmId, status);
      setSnackbar({ open: true, message: status === "TAKEN" ? "✅ Marked as taken!" : "⏭ Alarm skipped." });
    } catch (e) {
      console.error("Log failed:", e);
      setError("Failed to log medication");
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
            ? [...a.repeatDays]
                .sort((x, y) => DAY_ORDER.indexOf(x) - DAY_ORDER.indexOf(y))
                .map((d) => DAY_ABBR[d] || d)
                .join(", ")
            : "";
          return (
            <React.Fragment key={a.id}>
              <ListItem
                secondaryAction={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => handleLog(a.id, "TAKEN")}
                      sx={{ minWidth: 0, px: 1 }}
                    >
                      ✅
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      onClick={() => handleLog(a.id, "SKIPPED")}
                      sx={{ minWidth: 0, px: 1 }}
                    >
                      ⏭
                    </Button>
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AlarmList;
