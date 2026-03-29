import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SnoozeIcon from '@mui/icons-material/Snooze';
import MedicationIcon from '@mui/icons-material/Medication';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import { useNavigate } from 'react-router-dom';
import AppScreen from '../components/Layout/AppScreen';
import NextAlarmCard from '../components/Dashboard/NextAlarmCard';
import ReminderPermissionCard from '../components/Common/ReminderPermissionCard';
import { useAuth } from '../context/AuthContext';
import { useMedData } from '../context/MedDataContext';
import { useSettings } from '../context/SettingsContext';
import { logAPI } from '../services/api';
import {
  getReminderPermissionStatus,
  requestReminderPermission,
  scheduleSnoozedReminder,
  syncNativeAlarmNotifications,
} from '../services/reminderService';
import { findNextAlarm, formatTime12h, getTodaysAlarms } from '../utils/alarmTimeline';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function TodayPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { medicines, alarms, logs, loading, error, offline, refreshAll, lastSyncedAt } = useMedData();
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const medNameById = useMemo(() => {
    const map = new Map();
    medicines.forEach((medicine) => map.set(medicine.id, medicine.name));
    return map;
  }, [medicines]);

  const medicineById = useMemo(() => {
    const map = new Map();
    medicines.forEach((medicine) => map.set(medicine.id, medicine));
    return map;
  }, [medicines]);

  const todaysAlarms = useMemo(() => getTodaysAlarms(alarms), [alarms]);
  const nextAlarm = useMemo(() => findNextAlarm(alarms), [alarms]);
  const takenThisWeek = logs.filter((log) => log.status === 'TAKEN').length;

  useEffect(() => {
    getReminderPermissionStatus().then(setPermissionStatus).catch(() => setPermissionStatus('prompt'));
  }, []);

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleLog = async (alarmId, status) => {
    try {
      await logAPI.log(alarmId, status);
      await refreshAll({ background: true });
      showMessage(status === 'TAKEN' ? 'Dose marked as taken.' : 'Dose marked as skipped.');
    } catch (actionError) {
      console.error('Failed to log medication action:', actionError);
      showMessage('Could not update this dose.', 'error');
    }
  };

  const handleSnooze = async (alarm) => {
    const medicine = medicineById.get(alarm.medicineId);
    try {
      await logAPI.log(alarm.id, 'SNOOZED');
      await scheduleSnoozedReminder({
        alarmId: alarm.id,
        medicineName: medicine?.name,
        dosage: medicine?.dosage,
        minutes: settings.snoozeDurationMinutes,
      });
      await refreshAll({ background: true });
      showMessage(`Reminder snoozed for ${settings.snoozeDurationMinutes} minutes.`);
    } catch (snoozeError) {
      console.error('Failed to snooze alarm:', snoozeError);
      showMessage('Could not snooze this reminder.', 'error');
    }
  };

  const enableReminders = async () => {
    const status = await requestReminderPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      await syncNativeAlarmNotifications(alarms, medicines);
      showMessage('Reminders are enabled.');
    }
  };

  return (
    <AppScreen
      title={`${getGreeting()}, ${user?.username}`}
      subtitle="Your next doses, quick actions, and reminder status all live here."
    >
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <ReminderPermissionCard status={permissionStatus} onEnable={enableReminders} />

        <Card
          sx={{
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #0b1730 0%, #133b5c 60%, #0c6b58 100%)'
                : 'linear-gradient(135deg, #dcefff 0%, #eef8ff 50%, #dff8ef 100%)',
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Grid container spacing={2.5} alignItems="stretch">
              <Grid item xs={12} md={7}>
                <Typography variant="overline" sx={{ letterSpacing: '0.16em', color: 'text.secondary' }}>
                  Today Focus
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em', mb: 1 }}>
                  {nextAlarm
                    ? `${formatTime12h(nextAlarm.alarmTime)} is your next dose`
                    : 'You are clear for now'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, maxWidth: 560 }}>
                  {nextAlarm
                    ? `Keep momentum: ${medNameById.get(nextAlarm.medicineId) || 'your medicine'} is up next.`
                    : 'No upcoming reminders were found across your active schedules.'}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip icon={<MedicationIcon />} label={`${medicines.length} medicines`} color="primary" />
                  <Chip icon={<AccessTimeIcon />} label={`${todaysAlarms.length} doses today`} color="secondary" />
                  <Chip icon={<CheckCircleOutlineIcon />} label={`${takenThisWeek} taken this week`} variant="outlined" />
                  {offline && <Chip icon={<SyncProblemIcon />} label="Offline mode" color="warning" variant="outlined" />}
                </Stack>
                <Stack direction="row" spacing={1.25} sx={{ mt: 2.5 }} flexWrap="wrap" useFlexGap>
                  <Button variant="contained" onClick={() => navigate('/medicines')}>
                    Manage medicines
                  </Button>
                  <Button variant="outlined" onClick={() => navigate('/history')}>
                    View history
                  </Button>
                </Stack>
                {lastSyncedAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    Last synced {new Date(lastSyncedAt).toLocaleString()}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={5}>
                <NextAlarmCard alarms={alarms} medNameById={medNameById} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.75 }}>
              Today&apos;s plan
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Fast, thumb-friendly actions for the doses scheduled today.
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={30} />
              </Box>
            ) : todaysAlarms.length === 0 ? (
              <Alert severity="info">No active alarms are scheduled for today.</Alert>
            ) : (
              <Grid container spacing={2}>
                {todaysAlarms.map((alarm) => {
                  const medicine = medicineById.get(alarm.medicineId);
                  return (
                    <Grid item xs={12} key={alarm.id}>
                      <Card variant="outlined" sx={{ borderRadius: 4 }}>
                        <CardContent
                          sx={{
                            display: 'flex',
                            gap: 2,
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                          }}
                        >
                          <Box>
                            <Typography variant="overline" color="text.secondary">
                              {alarm.source === 'AUTO' ? 'Auto schedule' : 'Custom alarm'}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                              {formatTime12h(alarm.alarmTime)}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5 }}>
                              {medicine?.name || 'Medicine'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {medicine?.dosage || 'Dose not set'} • {medicine?.frequency || 'Schedule not set'}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => handleLog(alarm.id, 'TAKEN')}
                            >
                              Taken
                            </Button>
                            <Button
                              variant="outlined"
                              color="warning"
                              startIcon={<SnoozeIcon />}
                              onClick={() => handleSnooze(alarm)}
                            >
                              Snooze
                            </Button>
                            <Button
                              variant="text"
                              color="inherit"
                              onClick={() => handleLog(alarm.id, 'SKIPPED')}
                            >
                              Skip
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppScreen>
  );
}

export default TodayPage;
