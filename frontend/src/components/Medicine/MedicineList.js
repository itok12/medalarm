import React from "react";
import { List, ListItem, ListItemText, Typography, Divider, Box } from "@mui/material";

function MedicineList({ medicines = [] }) {
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
            <ListItem>
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
    </Box>
  );
}

export default MedicineList;
