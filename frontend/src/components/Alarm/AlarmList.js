import React, { useMemo, useState } from "react";
import { alarmAPI } from "../../services/api";
import {
  Alert,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Switch,
  Typography,
} from "@mui/material";

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
          return (
            <React.Fragment key={a.id}>
              <ListItem
                secondaryAction={
                  <Switch checked={!!a.active} onChange={() => handleToggle(a)} />
                }
              >
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 700 }}>{a.alarmTime}</Typography>}
                  secondary={
                    <>
                      <span>{medName}</span>
                      {a.repeatDays?.length ? ` • ${a.repeatDays.join(", ")}` : ""}
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
