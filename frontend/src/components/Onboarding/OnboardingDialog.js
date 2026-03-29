import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MobileStepper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMedData } from '../../context/MedDataContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { userAPI } from '../../services/api';
import {
  getReminderPermissionStatus,
  requestReminderPermission,
  syncNativeAlarmNotifications,
} from '../../services/reminderService';
import { trackEvent } from '../../services/telemetry';

const STEP_TITLES = ['Welcome', 'Preferences', 'Reminders', 'First medicine'];

function OnboardingDialog() {
  const navigate = useNavigate();
  const { user, updateUserFromProfile } = useAuth();
  const { medicines, alarms, loading } = useMedData();
  const {
    hydrated,
    readyToComplete,
    state,
    completeOnboarding,
    markStep,
    setOpen,
  } = useOnboarding();
  const [activeStep, setActiveStep] = useState(0);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [feedback, setFeedback] = useState({ severity: 'info', message: '' });
  const [profileDraft, setProfileDraft] = useState({
    timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    defaultAlarmTime: user?.defaultAlarmTime || '08:00',
    emailRemindersEnabled: !!user?.emailRemindersEnabled,
  });

  useEffect(() => {
    setProfileDraft({
      timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      defaultAlarmTime: user?.defaultAlarmTime || '08:00',
      emailRemindersEnabled: !!user?.emailRemindersEnabled,
    });
  }, [user?.defaultAlarmTime, user?.emailRemindersEnabled, user?.timezone]);

  useEffect(() => {
    getReminderPermissionStatus()
      .then(setPermissionStatus)
      .catch(() => setPermissionStatus('prompt'));
  }, []);

  useEffect(() => {
    if (medicines.length > 0 && !state.steps.medicine) {
      markStep('medicine');
      trackEvent('onboarding_medicine_completed', { medicine_count: medicines.length });
    }
  }, [markStep, medicines.length, state.steps.medicine]);

  const open = hydrated && !state.completedAt && state.open;

  const stepContent = useMemo(() => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={2}>
            <Alert icon={<CheckCircleOutlineIcon fontSize="inherit" />} severity="info">
              MedAlarm works best when you set your defaults, allow reminders, and add at least one medicine.
            </Alert>
            <Typography variant="body1" color="text.secondary">
              This quick setup keeps the Today screen useful, makes native notifications reliable,
              and gives the app the information it needs to generate better schedules.
            </Typography>
          </Stack>
        );
      case 1:
        return (
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TuneOutlinedIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Pick your reminder defaults
              </Typography>
            </Box>
            <TextField
              label="Timezone"
              value={profileDraft.timezone}
              onChange={(event) =>
                setProfileDraft((prev) => ({ ...prev, timezone: event.target.value }))
              }
              helperText="Use an IANA timezone such as Europe/London or America/New_York"
            />
            <TextField
              label="Default alarm time"
              type="time"
              value={profileDraft.defaultAlarmTime}
              onChange={(event) =>
                setProfileDraft((prev) => ({ ...prev, defaultAlarmTime: event.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={profileDraft.emailRemindersEnabled}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({
                      ...prev,
                      emailRemindersEnabled: event.target.checked,
                    }))
                  }
                />
              }
              label="Enable email reminders when backend mail is configured"
            />
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsActiveOutlinedIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Turn on reminders
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              On mobile, MedAlarm schedules native local notifications. On the web, reminders work
              while the app is open.
            </Typography>
            <Alert severity={permissionStatus === 'granted' ? 'success' : 'info'}>
              Current reminder permission: <strong>{permissionStatus}</strong>
            </Alert>
          </Stack>
        );
      default:
        return (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MedicationOutlinedIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Add your first medicine
              </Typography>
            </Box>
            {medicines.length > 0 ? (
              <Alert severity="success">
                You already have {medicines.length} medicine{medicines.length === 1 ? '' : 's'} set up.
              </Alert>
            ) : (
              <Alert severity="info">
                Add your first medicine to unlock a truly useful Today view and real reminder times.
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary">
              Once a medicine exists, MedAlarm can auto-generate schedules and keep the Today screen focused on the next action.
            </Typography>
          </Stack>
        );
    }
  }, [
    activeStep,
    medicines.length,
    permissionStatus,
    profileDraft.defaultAlarmTime,
    profileDraft.emailRemindersEnabled,
    profileDraft.timezone,
  ]);

  if (!open) {
    return null;
  }

  const handleNext = async () => {
    if (activeStep === 0) {
      markStep('welcome');
      trackEvent('onboarding_welcome_seen');
      setActiveStep(1);
      return;
    }

    if (activeStep === 1) {
      setSavingPreferences(true);
      setFeedback({ severity: 'info', message: '' });
      try {
        const response = await userAPI.updateMe(profileDraft);
        updateUserFromProfile(response.data);
        markStep('profile');
        trackEvent('onboarding_profile_saved', {
          email_reminders_enabled: profileDraft.emailRemindersEnabled,
        });
        setFeedback({ severity: 'success', message: 'Defaults saved.' });
        setActiveStep(2);
      } catch (error) {
        setFeedback({
          severity: 'error',
          message: error.response?.data?.error || 'Could not save your defaults.',
        });
      } finally {
        setSavingPreferences(false);
      }
      return;
    }

    if (activeStep === 2) {
      const status = await requestReminderPermission();
      setPermissionStatus(status);
      markStep('reminders');
      trackEvent('onboarding_reminder_permission', { status });
      if (status === 'granted') {
        await syncNativeAlarmNotifications(alarms, medicines);
      }
      setActiveStep(3);
      return;
    }

    if (readyToComplete) {
      completeOnboarding();
      trackEvent('onboarding_completed', { medicine_count: medicines.length });
      return;
    }

    navigate('/medicines');
    setOpen(false);
  };

  return (
    <Dialog open={open} fullWidth maxWidth="sm" onClose={() => setOpen(false)}>
      <DialogTitle sx={{ pb: 1 }}>{STEP_TITLES[activeStep]}</DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Setup step {activeStep + 1} of {STEP_TITLES.length}
        </Typography>
        {feedback.message && (
          <Alert severity={feedback.severity} sx={{ mb: 2 }}>
            {feedback.message}
          </Alert>
        )}
        {loading && activeStep === 3 ? (
          <Typography color="text.secondary">Checking your medicines...</Typography>
        ) : (
          stepContent
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button
          startIcon={<KeyboardArrowLeftIcon />}
          disabled={activeStep === 0 || savingPreferences}
          onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
        >
          Back
        </Button>
        <MobileStepper
          variant="dots"
          steps={STEP_TITLES.length}
          position="static"
          activeStep={activeStep}
          nextButton={null}
          backButton={null}
          sx={{ flex: 1, bgcolor: 'transparent', justifyContent: 'center' }}
        />
        <Stack direction="row" spacing={1}>
          <Button color="inherit" onClick={() => setOpen(false)}>
            Continue later
          </Button>
          <Button
            variant="contained"
            endIcon={<KeyboardArrowRightIcon />}
            disabled={savingPreferences}
            onClick={handleNext}
          >
            {activeStep === 3
              ? readyToComplete
                ? 'Finish setup'
                : 'Go to medicines'
              : 'Continue'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

export default OnboardingDialog;
