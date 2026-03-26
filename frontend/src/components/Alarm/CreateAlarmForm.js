import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  Checkbox,
  Stack,
} from "@mui/material";
import { alarmAPI } from "../../services/api";

const DAYS = [
  { key: "MONDAY", label: "Mon" },
  { key: "TUESDAY", label: "Tue" },
  { key: "WEDNESDAY", label: "Wed" },
  { key: "THURSDAY", label: "Thu" },
  { key: "FRIDAY", label: "Fri" },
  { key: "SATURDAY", label: "Sat" },
  { key: "SUNDAY", label: "Sun" },
];

function CreateAlarmForm({ medicines = [], onAlarmCreated }) {
  const defaultMedId = useMemo(() => (medicines.length ? medicines[0].id : ""), [medicines]);

  const [medicineId, setMedicineId] = useState(defaultMedId);
  const [alarmTime, setAlarmTime] = useState("08:00");
  const [repeatDays, setRepeatDays] = useState(["MONDAY"]);
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");

  // IMPORTANT: when medicines load async, set a default selection
  useEffect(() => {
    if (!medicineId && medicines.length) setMedicineId(medicines[0].id);
  }, [medicines, medicineId]);

  const toggleDay = (dayKey) => {
    setRepeatDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!medicineId) {
      setError("Add a medicine first.");
      return;
    }

    try {
      await alarmAPI.create({
        medicineId: Number(medicineId),
        alarmTime,
        repeatDays,
        active,
      });

      await onAlarmCreated?.();
    } catch (e2) {
      console.error(e2);
      setError("Failed to create alarm");
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Create an Alarm
      </Typography>

      {!medicines.length && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No medicines yet — add a medicine first.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <FormControl fullWidth disabled={!medicines.length}>
          <InputLabel id="medicine-select-label">Medicine</InputLabel>
          <Select
            labelId="medicine-select-label"
            label="Medicine"
            value={medicineId}
            onChange={(e) => setMedicineId(e.target.value)}
          >
            {medicines.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Time"
          type="time"
          value={alarmTime}
          onChange={(e) => setAlarmTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <FormControlLabel
          control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />}
          label="Active"
        />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Repeat days
          </Typography>

          <FormGroup row sx={{ gap: 1 }}>
            {DAYS.map((d) => (
              <FormControlLabel
                key={d.key}
                control={
                  <Checkbox
                    checked={repeatDays.includes(d.key)}
                    onChange={() => toggleDay(d.key)}
                  />
                }
                label={d.label}
              />
            ))}
          </FormGroup>
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={!medicines.length}
        >
          Create Alarm
        </Button>
      </Stack>
    </Box>
  );
}

export default CreateAlarmForm;
