import React, { useState } from 'react';
import {
  TextField, Button, Box, MenuItem, Alert, Typography,
} from '@mui/material';
import { medicineAPI, alarmAPI } from '../../services/api';
import { captureException, trackEvent } from '../../services/telemetry';

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

const FREQUENCIES = [
  'Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed',
];

const INITIAL_MEDICINE = {
  name: '',
  dosage: '',
  frequency: '',
  instructions: '',
  imageUrl: '',
  startDate: getTodayIsoDate(),
  endDate: '',
};

const MedicineForm = ({ onMedicineAdded }) => {
  const [medicine, setMedicine] = useState(INITIAL_MEDICINE);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const nextErrors = {};
    if (!medicine.name.trim()) nextErrors.name = 'Medicine name is required';
    if (!medicine.dosage.trim()) nextErrors.dosage = 'Dosage is required';
    if (!medicine.frequency) nextErrors.frequency = 'Frequency is required';
    if (!medicine.startDate) nextErrors.startDate = 'Start date is required';
    if (medicine.endDate && medicine.endDate < medicine.startDate) {
      nextErrors.endDate = 'End date must be on or after the start date';
    }
    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMedicine((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      const payload = {
        ...medicine,
        endDate: medicine.endDate || null,
      };
      const response = await medicineAPI.create(payload);

      try {
        await alarmAPI.generate(response.data.id);
        trackEvent('medicine_added', {
          frequency: payload.frequency,
          has_end_date: !!payload.endDate,
        });
      } catch (generationError) {
        captureException(generationError, { source: 'MedicineForm.alarmGeneration' });
        setServerError('Medicine saved, but automatic alarm generation failed.');
      }

      await onMedicineAdded?.();
      setMedicine(INITIAL_MEDICINE);
    } catch (error) {
      captureException(error, { source: 'MedicineForm.createMedicine' });
      setServerError(error.response?.data?.error || 'Failed to add medicine');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Add New Medicine
      </Typography>
      {serverError && <Alert severity="error" sx={{ mb: 1 }}>{serverError}</Alert>}

      <TextField
        label="Medicine Name"
        name="name"
        fullWidth
        required
        margin="dense"
        value={medicine.name}
        onChange={handleChange}
        error={!!errors.name}
        helperText={errors.name}
      />
      <TextField
        label="Dosage (e.g. 500mg)"
        name="dosage"
        fullWidth
        margin="dense"
        value={medicine.dosage}
        onChange={handleChange}
        error={!!errors.dosage}
        helperText={errors.dosage}
      />
      <TextField
        select
        label="Frequency"
        name="frequency"
        fullWidth
        margin="dense"
        value={medicine.frequency}
        onChange={handleChange}
        error={!!errors.frequency}
        helperText={errors.frequency}
      >
        {FREQUENCIES.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </TextField>
      <TextField
        label="Start Date"
        name="startDate"
        type="date"
        fullWidth
        margin="dense"
        value={medicine.startDate}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        error={!!errors.startDate}
        helperText={errors.startDate}
      />
      <TextField
        label="End Date"
        name="endDate"
        type="date"
        fullWidth
        margin="dense"
        value={medicine.endDate}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        error={!!errors.endDate}
        helperText={errors.endDate || 'Optional: alarms will auto-deactivate after this date'}
      />
      <TextField
        label="Instructions"
        name="instructions"
        fullWidth
        margin="dense"
        multiline
        rows={2}
        value={medicine.instructions}
        onChange={handleChange}
      />

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 1.5 }}>Add Medicine</Button>
    </Box>
  );
};

export default MedicineForm;
