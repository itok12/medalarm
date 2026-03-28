import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem, Alert } from '@mui/material';
import { medicineAPI } from '../../services/api';

const FREQUENCIES = [
  'Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed',
];

function normalizeDate(value) {
  return value ? String(value).slice(0, 10) : '';
}

function EditMedicineForm({ medicine, onSaved }) {
  const [form, setForm] = useState({
    name: medicine.name || '',
    dosage: medicine.dosage || '',
    frequency: medicine.frequency || '',
    instructions: medicine.instructions || '',
    imageUrl: medicine.imageUrl || '',
    startDate: normalizeDate(medicine.startDate),
    endDate: normalizeDate(medicine.endDate),
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Medicine name is required';
    if (!form.dosage.trim()) nextErrors.dosage = 'Dosage is required';
    if (!form.frequency) nextErrors.frequency = 'Frequency is required';
    if (!form.startDate) nextErrors.startDate = 'Start date is required';
    if (form.endDate && form.endDate < form.startDate) {
      nextErrors.endDate = 'End date must be on or after the start date';
    }
    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    setLoading(true);
    try {
      await medicineAPI.update(medicine.id, {
        ...form,
        endDate: form.endDate || null,
      });
      onSaved?.();
    } catch (error) {
      console.error('Update failed:', error);
      setServerError(error.response?.data?.error || 'Failed to update medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
      {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

      <TextField
        fullWidth
        label="Medicine Name"
        name="name"
        margin="normal"
        value={form.name}
        onChange={handleChange}
        error={!!errors.name}
        helperText={errors.name}
      />
      <TextField
        fullWidth
        label="Dosage"
        name="dosage"
        margin="normal"
        value={form.dosage}
        onChange={handleChange}
        error={!!errors.dosage}
        helperText={errors.dosage}
      />
      <TextField
        select
        fullWidth
        label="Frequency"
        name="frequency"
        margin="normal"
        value={form.frequency}
        onChange={handleChange}
        error={!!errors.frequency}
        helperText={errors.frequency}
      >
        {FREQUENCIES.map((frequency) => (
          <MenuItem key={frequency} value={frequency}>{frequency}</MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        label="Start Date"
        name="startDate"
        type="date"
        margin="normal"
        value={form.startDate}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        error={!!errors.startDate}
        helperText={errors.startDate}
      />
      <TextField
        fullWidth
        label="End Date"
        name="endDate"
        type="date"
        margin="normal"
        value={form.endDate}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        error={!!errors.endDate}
        helperText={errors.endDate}
      />
      <TextField
        fullWidth
        label="Instructions"
        name="instructions"
        margin="normal"
        multiline
        rows={2}
        value={form.instructions}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        label="Image URL"
        name="imageUrl"
        margin="normal"
        value={form.imageUrl}
        onChange={handleChange}
      />

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </Box>
  );
}

export default EditMedicineForm;
