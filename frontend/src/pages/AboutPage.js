import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link,
  Typography,
  Fade,
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import BarChartIcon from '@mui/icons-material/BarChart';
import SecurityIcon from '@mui/icons-material/Security';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import GroupIcon from '@mui/icons-material/Group';
import CodeIcon from '@mui/icons-material/Code';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AppScreen from '../components/Layout/AppScreen';

const FEATURES = [
  {
    icon: <MedicalServicesIcon color="primary" />,
    title: 'Medicine Management',
    desc: 'Track medicines with dosage, schedule, start date, and end date support.',
  },
  {
    icon: <NotificationsActiveIcon color="primary" />,
    title: 'Native Reminders',
    desc: 'MedAlarm now supports native mobile reminders on iOS and Android in addition to the web app.',
  },
  {
    icon: <BarChartIcon color="primary" />,
    title: 'Adherence Tracking',
    desc: 'Review taken, skipped, and snoozed activity through a focused history experience.',
  },
  {
    icon: <SecurityIcon color="primary" />,
    title: 'Secure by Default',
    desc: 'Actor-scoped APIs, JWT auth, refresh token rotation, and guarded caregiver access.',
  },
  {
    icon: <PhoneAndroidIcon color="primary" />,
    title: 'Cross Platform',
    desc: 'A single React codebase now powers the web experience and native shells through Capacitor.',
  },
  {
    icon: <GroupIcon color="primary" />,
    title: 'Caregiver Visibility',
    desc: 'Caregivers can monitor linked patients without being able to edit medicines or alarms.',
  },
];

const TECH_STACK = [
  { label: 'React 18', color: 'primary' },
  { label: 'Material UI', color: 'secondary' },
  { label: 'Spring Boot', color: 'default' },
  { label: 'PostgreSQL', color: 'default' },
  { label: 'Flyway', color: 'default' },
  { label: 'Capacitor', color: 'primary' },
  { label: 'Docker', color: 'default' },
];

function AboutPage() {
  return (
    <AppScreen
      title="About MedAlarm"
      subtitle="Why MedAlarm exists, what it helps people do, and how the app is built."
      maxWidth={960}
    >
      <Fade in timeout={400}>
        <Box>
          <Card
            sx={{
              mb: 4,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #102146 0%, #0d47a1 55%, #0f766e 100%)'
                  : 'linear-gradient(135deg, #1565c0 0%, #0288d1 55%, #0f766e 100%)',
              color: '#fff',
            }}
          >
            <CardContent sx={{ py: 5, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.04em' }}>
                MedAlarm
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.92, fontWeight: 400, mb: 2 }}>
                Your medicine routine, designed for real life
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.84, maxWidth: 620, mx: 'auto' }}>
                MedAlarm helps people stay on track with medication schedules through reliable reminders,
                quick dose actions, adherence history, and caregiver visibility.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FavoriteIcon color="error" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Mission
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                MedAlarm exists to make medication adherence feel less like admin work and more like
                a calm daily rhythm. The goal is simple: help people remember what to take, when to
                take it, and how well they are sticking to the plan over time.
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Feature highlights
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {FEATURES.map((feature) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ mb: 1 }}>{feature.icon}</Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CodeIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Built with
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {TECH_STACK.map((item) => (
                  <Chip
                    key={item.label}
                    label={item.label}
                    color={item.color}
                    variant={item.color === 'default' ? 'outlined' : 'filled'}
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Open source
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                MedAlarm is open source and available on GitHub for contributions, bug reports, and feature requests.
              </Typography>
              <Link
                href="https://github.com/itok12/medalarm"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontWeight: 600 }}
              >
                github.com/itok12/medalarm
              </Link>
            </CardContent>
          </Card>
        </Box>
      </Fade>
    </AppScreen>
  );
}

export default AboutPage;
