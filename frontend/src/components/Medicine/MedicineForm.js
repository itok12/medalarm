import React, { useState } from 'react';
import {
  TextField, Button, Box, MenuItem, Alert
} from '@mui/material';
import { medicineAPI, alarmAPI } from '../../services/api';

const MedicineForm = ({ onMedicineAdded, userId }) => {
  const [medicine, setMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const frequencies = [
    'Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed'
  ];

  const validate = () => {
    const errs = {};
    if (!medicine.name.trim()) errs.name = 'Medicine name is required';
    if (!medicine.dosage.trim()) errs.dosage = 'Dosage is required';
    if (!medicine.frequency) errs.frequency = 'Frequency is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicine((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      const payload = { ...medicine, userId };
      const response = await medicineAPI.create(payload);

      try {
        await alarmAPI.generate(response.data.id);
      } catch (genErr) {
        console.error("Alarm generation failed:", genErr);
        setServerError("Medicine saved, but failed to auto-generate alarms.");
      }

      await onMedicineAdded?.();

      setMedicine({
        name: '', dosage: '', frequency: '', duration: '', instructions: '', imageUrl: '',
      });
    } catch (err) {
      console.error("Medicine create failed:", err);
      setServerError("Failed to add medicine");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <h3>Add New Medicine</h3>
      {serverError && <Alert severity="error" sx={{ mb: 1 }}>{serverError}</Alert>}

      <TextField
        label="Medicine Name" name="name" fullWidth required margin="normal"
        value={medicine.name} onChange={handleChange}
        error={!!errors.name} helperText={errors.name}
      />
      <TextField
        label="Dosage" name="dosage" fullWidth margin="normal"
        value={medicine.dosage} onChange={handleChange}
        error={!!errors.dosage} helperText={errors.dosage}
      />
      <TextField
        select label="Frequency" name="frequency" fullWidth margin="normal"
        value={medicine.frequency} onChange={handleChange}
        error={!!errors.frequency} helperText={errors.frequency}
      >
        {frequencies.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </TextField>
      <TextField label="Duration" name="duration" fullWidth margin="normal" value={medicine.duration} onChange={handleChange} />
      <TextField label="Instructions" name="instructions" fullWidth margin="normal" multiline rows={3} value={medicine.instructions} onChange={handleChange} />
      <TextField label="Image URL" name="imageUrl" fullWidth margin="normal" value={medicine.imageUrl} onChange={handleChange} />

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Add Medicine</Button>
    </Box>
  );
};

export default MedicineForm;
