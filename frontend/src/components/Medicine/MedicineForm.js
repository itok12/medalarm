import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  MenuItem
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
    userId: userId
  });

  const [error, setError] = useState('');

  const frequencies = [
    'Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicine((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = { ...medicine, userId };
      // Removed unnecessary delete payload.user

      const response = await medicineAPI.create(payload);
      await onMedicineAdded?.();

      try {
        await alarmAPI.generate(response.data.id);
        await onMedicineAdded?.(); 
      } catch (genErr) {
        console.error("Alarm generation failed:", genErr);
        setError("Medicine saved, but failed to auto-generate alarms.");
      }

      setMedicine({
        name: "", dosage: "", frequency: "", duration: "", instructions: "", imageUrl: "", userId,
      });

    } catch (err) {
      console.error("Medicine create failed:", err);
      setError("Failed to add medicine");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <h3>Add New Medicine</h3>
      {error && <div style={{color: 'red', marginBottom: 10}}>{error}</div>}
      
      <TextField label="Medicine Name" name="name" fullWidth required margin="normal" value={medicine.name} onChange={handleChange} />
      <TextField label="Dosage" name="dosage" fullWidth margin="normal" value={medicine.dosage} onChange={handleChange} />
      
      <TextField select label="Frequency" name="frequency" fullWidth margin="normal" value={medicine.frequency} onChange={handleChange}>
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
