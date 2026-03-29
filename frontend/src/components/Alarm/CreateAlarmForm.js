import React, { useEffect, useMemo, useState } from 'react';
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
} from '@mui/material';
import { alarmAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { captureException, trackEvent } from '../../services/telemetry';

const DAYS = [
  { key: 'MONDAY', label: 'Mon' },
  { key: 'TUESDAY', label: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wed' },
  { key: 'THURSDAY', label: 'Thu' },
  { key: 'FRIDAY', label: 'Fri' },
  { key: 'SATURDAY', label: 'Sat' },
  { key: 'SUNDAY', label: 'Sun' },
];

function normalizeTime(value) {
  if (!value) return '08:00';
  return String(value).slice(0, 5);
}

function CreateAlarmForm({ medicines = [], onAlarmCreated }) {
  const { user } = useAuth();
  const defaultMedId = useMemo(() => (medicines.length ? medicines[0].id : ''), [medicines]);

  const [medicineId, setMedicineId] = useState(defaultMedId);
  const [alarmTime, setAlarmTime] = useState(normalizeTime(user?.defaultAlarmTime));
  const [repeatDays, setRepeatDays] = useState(['MONDAY']);
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!medicineId && medicines.length) setMedicineId(medicines[0].id);
  }, [medicines, medicineId]);

  useEffect(() => {
    setAlarmTime(normalizeTime(user?.defaultAlarmTime));
  }, [user?.defaultAlarmTime]);

  const toggleDay = (dayKey) => {
    setRepeatDays((prev) =>
      prev.includes(dayKey) ? prev.filter((day) => day !== dayKey) : [...prev, dayKey]
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!medicineId) {
      setError('Please select a medicine.');
      return;
    }
    if (!alarmTime) {
      setError('Please set an alarm time.');
      return;
    }
    if (repeatDays.length === 0) {
      setError('Select at least one repeat day.');
      return;
    }

    try {
      await alarmAPI.create({
        medicineId: Number(medicineId),
        alarmTime,
        repeatDays,
        active,
      });

      setAlarmTime(normalizeTime(user?.defaultAlarmTime));
      trackEvent('manual_alarm_created', { repeat_day_count: repeatDays.length });
      await onAlarmCreated?.();
    } catch (creationError) {
      captureException(creationError, { source: 'CreateAlarmForm.createAlarm' });
      setError(creationError.response?.data?.error || 'Failed to create alarm');
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Create an Alarm
      </Typography>

      {!medicines.length && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No medicines yet - add a medicine first.
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
            onChange={(event) => setMedicineId(event.target.value)}
          >
            {medicines.map((medicine) => (
              <MenuItem key={medicine.id} value={medicine.id}>
                {medicine.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Time"
          type="time"
          value={alarmTime}
          onChange={(event) => setAlarmTime(event.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <FormControlLabel
          control={<Switch checked={active} onChange={(event) => setActive(event.target.checked)} />}
          label="Active"
        />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Repeat days
          </Typography>

          <FormGroup row sx={{ gap: 1 }}>
            {DAYS.map((day) => (
              <FormControlLabel
                key={day.key}
                control={(
                  <Checkbox
                    checked={repeatDays.includes(day.key)}
                    onChange={() => toggleDay(day.key)}
                  />
                )}
                label={day.label}
              />
            ))}
          </FormGroup>
        </Box>

        <Button type="submit" variant="contained" size="large" disabled={!medicines.length}>
          Create Alarm
        </Button>
      </Stack>
    </Box>
  );
}

export default CreateAlarmForm;
