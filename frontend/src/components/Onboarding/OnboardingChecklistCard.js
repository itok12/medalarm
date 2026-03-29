import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';

const STEP_COPY = [
  {
    key: 'profile',
    title: 'Set your reminder defaults',
    desc: 'Choose your timezone, email reminders, and a default alarm time.',
    icon: <TuneOutlinedIcon color="primary" fontSize="small" />,
  },
  {
    key: 'reminders',
    title: 'Turn on reminders',
    desc: 'Enable notifications so MedAlarm can reach you at the right moment.',
    icon: <NotificationsActiveOutlinedIcon color="primary" fontSize="small" />,
  },
  {
    key: 'medicine',
    title: 'Add your first medicine',
    desc: 'Once your first medicine exists, your Today view becomes genuinely useful.',
    icon: <MedicationOutlinedIcon color="primary" fontSize="small" />,
  },
];

function OnboardingChecklistCard() {
  const navigate = useNavigate();
  const {
    completedSteps,
    readyToComplete,
    restartOnboarding,
    setOpen,
    shouldShowChecklist,
    state,
  } = useOnboarding();

  if (!shouldShowChecklist || state.open) {
    return null;
  }

  const progress = Math.round((completedSteps / 4) * 100);

  return (
    <Card sx={{ borderStyle: 'dashed' }}>
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
            <AutoAwesomeIcon color="primary" sx={{ mt: 0.25 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Finish your MedAlarm setup
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A quick checklist helps the app feel reliable from day one.
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {completedSteps}/4
            </Typography>
          </Box>

          <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 999 }} />

          <Stack spacing={1.25}>
            {STEP_COPY.map((step) => (
              <Alert
                key={step.key}
                severity={state.steps[step.key] ? 'success' : 'info'}
                icon={
                  state.steps[step.key] ? (
                    <CheckCircleOutlineIcon fontSize="inherit" />
                  ) : (
                    step.icon
                  )
                }
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {step.title}
                </Typography>
                <Typography variant="body2">{step.desc}</Typography>
              </Alert>
            ))}
          </Stack>

          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Continue setup
            </Button>
            {!state.steps.medicine && (
              <Button variant="outlined" onClick={() => navigate('/medicines')}>
                Add medicine
              </Button>
            )}
            {readyToComplete && (
              <Button variant="text" color="inherit" onClick={restartOnboarding}>
                Restart walkthrough
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default OnboardingChecklistCard;
