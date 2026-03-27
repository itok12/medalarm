import React, { useState } from "react";
import {
  List, ListItem, ListItemText, Typography, Divider, Box,
  IconButton, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { medicineAPI } from "../../services/api";
import EditMedicineForm from "./EditMedicineForm";

function parseDurationToDays(duration) {
  if (!duration) return null;
  const match = duration.trim().match(/^(\d+)\s*(day|days|week|weeks|month|months)$/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  if (unit.startsWith("day")) return value;
  if (unit.startsWith("week")) return value * 7;
  if (unit.startsWith("month")) return value * 30;
  return null;
}

function getMedicineStatus(medicine) {
  if (!medicine.startDate || !medicine.duration) return null;
  const days = parseDurationToDays(medicine.duration);
  if (days === null) return null;

  const start = new Date(medicine.startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + days);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffMs = end - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return { end, diffDays };
}

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
        {medicines.map((m, idx) => {
          const status = getMedicineStatus(m);
          return (
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography sx={{ fontWeight: 700 }}>
                        {m.name}{" "}
                        <Typography component="span" sx={{ fontWeight: 400 }} color="text.secondary">
                          {m.dosage ? `— ${m.dosage}` : ""}
                        </Typography>
                      </Typography>
                      {status && status.diffDays < 0 && (
                        <Chip label="Expired" size="small" color="error" />
                      )}
                      {status && status.diffDays >= 0 && status.diffDays <= 3 && (
                        <Chip label="Expiring soon" size="small" sx={{ bgcolor: "orange", color: "white" }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      {m.frequency && <span>Frequency: {m.frequency}</span>}
                      {m.startDate && status && (
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {" · "}Start: {m.startDate} · End: {status.end.toISOString().slice(0, 10)}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {idx !== medicines.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
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
