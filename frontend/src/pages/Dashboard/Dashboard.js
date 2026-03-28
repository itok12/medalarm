import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Grid, Alert, Box, Typography, Card, CardContent, CircularProgress, Fade,
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import TodayIcon from '@mui/icons-material/Today';
import Navbar from '../../components/Layout/Navbar';
import MedicineList from '../../components/Medicine/MedicineList';
import MedicineForm from '../../components/Medicine/MedicineForm';
import AlarmList from '../../components/Alarm/AlarmList';
import CreateAlarmForm from '../../components/Alarm/CreateAlarmForm';
import AlarmNotifier from '../../components/Alarm/AlarmNotifier';
import AdherenceChart from '../../components/Dashboard/AdherenceChart';
import NextAlarmCard from '../../components/Dashboard/NextAlarmCard';
import { medicineAPI, alarmAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function SummaryCard({ icon, label, value, color = 'primary.main' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            bgcolor: `${color}18`,
            borderRadius: '50%',
            p: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        </Box>
        <Box>
          <Typography color="text.secondary" variant="body2" sx={{ fontSize: '0.75rem' }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const medNameById = useMemo(() => {
    const map = new Map();
    medicines.forEach((medicine) => map.set(medicine.id, medicine.name));
    return map;
  }, [medicines]);

  const refreshAll = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setPageError('');
    try {
      const [medicineResponse, alarmResponse] = await Promise.all([
        medicineAPI.getAll(),
        alarmAPI.getAll(),
      ]);
      setMedicines(medicineResponse.data ?? []);
      setAlarms(alarmResponse.data ?? []);
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
      setPageError("Couldn't load data. Is the backend running on :8080?");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const todayDayName = DAYS_OF_WEEK[new Date().getDay()];
  const todaysAlarms = alarms
    .filter((alarm) => alarm.active && alarm.repeatDays?.includes(todayDayName))
    .sort((left, right) => (left.alarmTime > right.alarmTime ? 1 : -1));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Fade in timeout={400}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {getGreeting()}, {user?.username}!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Here&apos;s an overview of your medications today.
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <SummaryCard
                icon={<MedicalServicesIcon />}
                label="Medicines"
                value={medicines.length}
                color="primary.main"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <SummaryCard
                icon={<NotificationsActiveIcon />}
                label="Active Alarms"
                value={alarms.filter((alarm) => alarm.active).length}
                color="secondary.main"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <SummaryCard
                icon={<TodayIcon />}
                label={`Today (${todayDayName.charAt(0) + todayDayName.slice(1).toLowerCase()})`}
                value={todaysAlarms.length}
                color="#ed6c02"
              />
            </Grid>
          </Grid>

          {pageError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {pageError}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Your Medicines
                    </Typography>
                    <MedicineForm onMedicineAdded={refreshAll} />
                    <MedicineList medicines={medicines} onChanged={refreshAll} />
                  </CardContent>
                </Card>
                <AdherenceChart />
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Your Alarms
                    </Typography>
                    <CreateAlarmForm medicines={medicines} onAlarmCreated={refreshAll} />
                    <AlarmList alarms={alarms} medicines={medicines} onChanged={refreshAll} />
                  </CardContent>
                </Card>
                <NextAlarmCard alarms={alarms} medNameById={medNameById} />
              </Grid>
            </Grid>
          )}
        </Box>
      </Fade>

      <AlarmNotifier alarms={alarms} medicines={medicines} />
    </Box>
  );
}

export default Dashboard;
