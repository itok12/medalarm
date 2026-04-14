import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Link,
  Typography,
} from '@mui/material';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import AppScreen from '../components/Layout/AppScreen';

function PrivacyPage() {
  return (
    <AppScreen
      title="Privacy"
      subtitle="How MedAlarm handles account data, reminder preferences, and adherence history."
      maxWidth={860}
    >
      <Box sx={{ display: 'grid', gap: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SecurityOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Privacy in plain language
              </Typography>
            </Box>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
              MedAlarm stores the account information required to authenticate you, the medicine and alarm
              details you create, your reminder preferences, and the adherence actions you log.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LockOutlinedIcon color="secondary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                What the app stores
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              MedAlarm stores your username, email address, password hash, timezone, default alarm time,
              email reminder preference, medicines, alarms, adherence logs, and any caregiver links you explicitly create.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <VerifiedUserOutlinedIcon color="success" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                What the app does not do
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              MedAlarm does not sell personal data, expose adherence history to other users by default,
              or let caregivers edit your medicines or alarms in this version.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mt: 1.5 }}>
              Telemetry is optional and can be enabled by the deployment owner with environment variables for Google Analytics and Sentry.
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary">
          For public store metadata, host the static privacy page at{' '}
          <Link href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">
            /privacy-policy.html
          </Link>{' '}
          on your deployed frontend domain.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Support email: <Link href="mailto:support@medalarmapp.com">support@medalarmapp.com</Link>
        </Typography>
      </Box>
    </AppScreen>
  );
}

export default PrivacyPage;
