import React, { useState } from "react";
import { Box, TextField, Button, MenuItem, Alert } from "@mui/material";
import { medicineAPI } from "../../services/api";

const frequencies = [
  "Once daily", "Twice daily", "Three times daily", "Four times daily", "As needed"
];

function EditMedicineForm({ medicine, onSaved }) {
  const [form, setForm] = useState({
    name: medicine.name || "",
    dosage: medicine.dosage || "",
    frequency: medicine.frequency || "",
    duration: medicine.duration || "",
    instructions: medicine.instructions || "",
    imageUrl: medicine.imageUrl || "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Medicine name is required";
    if (!form.dosage.trim()) errs.dosage = "Dosage is required";
    if (!form.frequency) errs.frequency = "Frequency is required";
    return errs;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await medicineAPI.update(medicine.id, form);
      onSaved?.();
    } catch (err) {
      console.error("Update failed:", err);
      setServerError("Failed to update medicine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
      {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

      <TextField
        fullWidth label="Medicine Name" name="name" margin="normal"
        value={form.name} onChange={handleChange}
        error={!!errors.name} helperText={errors.name}
      />
      <TextField
        fullWidth label="Dosage" name="dosage" margin="normal"
        value={form.dosage} onChange={handleChange}
        error={!!errors.dosage} helperText={errors.dosage}
      />
      <TextField
        select fullWidth label="Frequency" name="frequency" margin="normal"
        value={form.frequency} onChange={handleChange}
        error={!!errors.frequency} helperText={errors.frequency}
      >
        {frequencies.map((f) => (
          <MenuItem key={f} value={f}>{f}</MenuItem>
        ))}
      </TextField>
      <TextField fullWidth label="Duration" name="duration" margin="normal" value={form.duration} onChange={handleChange} />
      <TextField fullWidth label="Instructions" name="instructions" margin="normal" multiline rows={2} value={form.instructions} onChange={handleChange} />
      <TextField fullWidth label="Image URL" name="imageUrl" margin="normal" value={form.imageUrl} onChange={handleChange} />

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading}>
        {loading ? "Saving…" : "Save Changes"}
      </Button>
    </Box>
  );
}

export default EditMedicineForm;
