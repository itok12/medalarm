import React, { useState } from "react";
import {
  List, ListItem, ListItemText, Typography, Divider, Box,
  IconButton, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { medicineAPI } from "../../services/api";
import EditMedicineForm from "./EditMedicineForm";

function MedicineList({ medicines = [], onChanged }) {
  const [editMedicine, setEditMedicine] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine and its alarms?")) return;
    try {
      await medicineAPI.delete(id);
      await onChanged?.();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  if (!medicines.length) {
    return (
      <Typography sx={{ mt: 2 }} color="text.secondary">
        No medicines yet — add your first one above.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }} color="text.secondary">
        Saved medicines ({medicines.length})
      </Typography>

      <List dense>
        {medicines.map((m, idx) => (
          <React.Fragment key={m.id}>
            <ListItem
              secondaryAction={
                <Box>
                  <IconButton size="small" onClick={() => setEditMedicine(m)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(m.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <Avatar
                src={m.imageUrl || undefined}
                sx={{ mr: 2, bgcolor: "primary.light" }}
              >
                {!m.imageUrl && "💊"}
              </Avatar>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 700 }}>
                    {m.name}{" "}
                    <Typography component="span" sx={{ fontWeight: 400 }} color="text.secondary">
                      {m.dosage ? `— ${m.dosage}` : ""}
                    </Typography>
                  </Typography>
                }
                secondary={m.frequency ? `Frequency: ${m.frequency}` : null}
              />
            </ListItem>
            {idx !== medicines.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      {/* Edit Dialog */}
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
