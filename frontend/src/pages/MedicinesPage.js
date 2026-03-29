import React from 'react';
import { Alert, Card, CardContent, Grid, Typography } from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AppScreen from '../components/Layout/AppScreen';
import MedicineForm from '../components/Medicine/MedicineForm';
import MedicineList from '../components/Medicine/MedicineList';
import CreateAlarmForm from '../components/Alarm/CreateAlarmForm';
import AlarmList from '../components/Alarm/AlarmList';
import { useMedData } from '../context/MedDataContext';

function MedicinesPage() {
  const { medicines, alarms, offline, refreshAll } = useMedData();

  return (
    <AppScreen
      title="Medicines"
      subtitle="Manage your treatment list, auto-generated schedules, and custom alarms in one place."
    >
      <Grid container spacing={3}>
        {offline && (
          <Grid item xs={12}>
            <Alert severity="warning">
              You are viewing cached data. Changes will need a live connection to sync.
            </Alert>
          </Grid>
        )}

        <Grid item xs={12} lg={5}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MedicationIcon color="primary" />
                Add medicine
              </Typography>
              <MedicineForm onMedicineAdded={() => refreshAll({ background: true })} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsActiveIcon color="primary" />
                Create alarm
              </Typography>
              <CreateAlarmForm medicines={medicines} onAlarmCreated={() => refreshAll({ background: true })} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Current medicines
              </Typography>
              <MedicineList medicines={medicines} onChanged={() => refreshAll({ background: true })} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Alarm schedule
              </Typography>
              <AlarmList
                alarms={alarms}
                medicines={medicines}
                onChanged={() => refreshAll({ background: true })}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppScreen>
  );
}

export default MedicinesPage;
