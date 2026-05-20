import React, { useRef, useState } from 'react';
import {
  TextField, Button, Box, MenuItem, Alert, Typography, CircularProgress, Stack,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { medicineAPI, alarmAPI } from '../../services/api';
import api from '../../services/api';
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
  const [scanning, setScanning] = useState(false);
  const [scanNote, setScanNote] = useState('');
  const fileInputRef = useRef(null);

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

  const handleScanImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanNote('');
    setServerError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/medicines/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      const { name, dosage, frequency, instructions, error: scanError } = response.data;

      if (scanError) {
        setScanNote('Could not identify the medication — please fill in manually.');
      } else {
        setMedicine((prev) => ({
          ...prev,
          name: name || prev.name,
          dosage: dosage || prev.dosage,
          frequency: FREQUENCIES.includes(frequency) ? frequency : prev.frequency,
          instructions: instructions || prev.instructions,
        }));
        setScanNote('Fields pre-filled from your photo — review before saving.');
        trackEvent('medicine_scanned');
      }
    } catch (err) {
      captureException(err, { source: 'MedicineForm.scanImage' });
      setScanNote('Scan failed — please fill in manually.');
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    setScanNote('');

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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleScanImage}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Add New Medicine
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={scanning ? <CircularProgress size={14} /> : <CameraAltIcon />}
          disabled={scanning}
          onClick={() => fileInputRef.current?.click()}
        >
          {scanning ? 'Scanning…' : 'Scan label'}
        </Button>
      </Stack>

      {serverError && <Alert severity="error" sx={{ mb: 1 }}>{serverError}</Alert>}
      {scanNote && (
        <Alert severity={scanNote.includes('pre-filled') ? 'success' : 'warning'} sx={{ mb: 1 }}>
          {scanNote}
        </Alert>
      )}

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
        helperText={errors.endDate || 'Optional: alarms stop after this date'}
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
