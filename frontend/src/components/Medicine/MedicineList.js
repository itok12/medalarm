import React, { useState } from 'react';
import {
  List, ListItem, ListItemText, Typography, Divider, Box,
  IconButton, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { medicineAPI } from '../../services/api';
import EditMedicineForm from './EditMedicineForm';

function MedicineList({ medicines = [], onChanged }) {
  const [editMedicine, setEditMedicine] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine and its alarms?')) return;
    try {
      await medicineAPI.delete(id);
      await onChanged?.();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (!medicines.length) {
    return (
      <Typography sx={{ mt: 2 }} color="text.secondary">
        No medicines yet - add your first one above.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }} color="text.secondary">
        Saved medicines ({medicines.length})
      </Typography>

      <List dense>
        {medicines.map((medicine, index) => (
          <React.Fragment key={medicine.id}>
            <ListItem
              secondaryAction={(
                <Box>
                  {/* Default size keeps a 48px touch target; labels are read by screen readers. */}
                  <IconButton aria-label={`Edit ${medicine.name}`} onClick={() => setEditMedicine(medicine)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label={`Delete ${medicine.name}`} color="error" onClick={() => handleDelete(medicine.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            >
              <Avatar src={medicine.imageUrl || undefined} sx={{ mr: 2, bgcolor: 'primary.light' }}>
                {!medicine.imageUrl && 'Rx'}
              </Avatar>
              <ListItemText
                primary={(
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {medicine.name}
                      <Typography component="span" sx={{ fontWeight: 400, ml: 0.5 }} color="text.secondary">
                        {medicine.dosage ? `- ${medicine.dosage}` : ''}
                      </Typography>
                    </Typography>
                    {medicine.status === 'EXPIRED' && (
                      <Chip label="Expired" size="small" color="error" />
                    )}
                    {medicine.status === 'EXPIRING_SOON' && (
                      <Chip label="Expiring soon" size="small" sx={{ bgcolor: 'orange', color: 'white' }} />
                    )}
                    {(() => {
                      if (medicine.pillsRemaining == null) return null;
                      const dosesPerDay = {
                        'Once daily': 1, 'Twice daily': 2, 'Three times daily': 3, 'Four times daily': 4,
                      }[medicine.frequency] || 1;
                      const perDose = medicine.pillsPerDose || 1;
                      const daysLeft = Math.floor(medicine.pillsRemaining / (perDose * dosesPerDay));
                      if (medicine.pillsRemaining === 0) return <Chip label="Out of pills" size="small" color="error" />;
                      if (daysLeft <= 7) return <Chip label={`Refill soon · ${medicine.pillsRemaining} left`} size="small" color="warning" />;
                      return <Chip label={`${medicine.pillsRemaining} pills`} size="small" variant="outlined" />;
                    })()}
                  </Box>
                )}
                secondary={(
                  <Box>
                    {medicine.frequency && <span>Frequency: {medicine.frequency}</span>}
                    {medicine.startDate && (
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {' · '}Start: {medicine.startDate}
                        {medicine.endDate ? ` · End: ${medicine.endDate}` : ''}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </ListItem>
            {index !== medicines.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      <Dialog open={!!editMedicine} onClose={() => setEditMedicine(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Medicine</DialogTitle>
        <DialogContent>
          {editMedicine && (
            <EditMedicineForm
              medicine={editMedicine}
              onSaved={() => {
                setEditMedicine(null);
                onChanged?.();
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMedicine(null)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MedicineList;
