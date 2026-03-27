import React from 'react';
import {
  Box, Card, CardContent, Typography, Divider, Link, Chip,
  Grid, Fade,
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import BarChartIcon from '@mui/icons-material/BarChart';
import SecurityIcon from '@mui/icons-material/Security';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import GroupIcon from '@mui/icons-material/Group';
import CodeIcon from '@mui/icons-material/Code';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Navbar from '../components/Layout/Navbar';

const FEATURES = [
  {
    icon: <MedicalServicesIcon color="primary" />,
    title: 'Medicine Management',
    desc: 'Add, edit, and track all your medications with dosage and schedule info.',
  },
  {
    icon: <NotificationsActiveIcon color="primary" />,
    title: 'Smart Alarms',
    desc: 'Auto-generate alarms from your medicine schedule with snooze and repeat options.',
  },
  {
    icon: <BarChartIcon color="primary" />,
    title: 'Adherence Tracking',
    desc: 'Visual 7-day chart showing your medication adherence history.',
  },
  {
    icon: <SecurityIcon color="primary" />,
    title: 'Secure & Private',
    desc: 'JWT authentication, bcrypt passwords, and rate limiting keep your data safe.',
  },
  {
    icon: <PhoneAndroidIcon color="primary" />,
    title: 'PWA Support',
    desc: 'Install MedAlarm on your phone like a native app via "Add to Home Screen".',
  },
  {
    icon: <GroupIcon color="primary" />,
    title: 'Caregiver Mode',
    desc: 'Let caregivers monitor patient adherence to ensure compliance.',
  },
];

const TECH_STACK = [
  { label: 'React 18', color: 'primary' },
  { label: 'Material UI v5', color: 'secondary' },
  { label: 'Spring Boot 3', color: 'default' },
  { label: 'PostgreSQL', color: 'default' },
  { label: 'JWT Auth', color: 'default' },
  { label: 'Recharts', color: 'default' },
  { label: 'PWA', color: 'primary' },
  { label: 'Docker', color: 'default' },
];

function AboutPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Fade in timeout={400}>
        <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, sm: 3 } }}>
          {/* Hero */}
          <Card
            sx={{
              mb: 4,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)'
                  : 'linear-gradient(135deg, #1565c0 0%, #0288d1 100%)',
              color: '#fff',
            }}
          >
            <CardContent sx={{ py: 5, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.5px' }}>
                💊 MedAlarm
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 2 }}>
                Your personal medicine reminder & adherence companion
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 560, mx: 'auto' }}>
                MedAlarm is a free, open-source application designed to help patients, caregivers,
                and healthcare professionals manage medications reliably and with confidence.
              </Typography>
            </CardContent>
          </Card>

          {/* Mission */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FavoriteIcon color="error" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Our Mission
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Medication non-adherence is a serious global health problem — it contributes to
                over 125,000 preventable deaths and costs the healthcare system hundreds of
                billions of dollars annually. MedAlarm was built to help people take the right
                medication at the right time, every day.
              </Typography>
            </CardContent>
          </Card>

          {/* Features */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Key Features
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {FEATURES.map((f, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ mb: 1 }}>{f.icon}</Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {f.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Tech Stack */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CodeIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Built With
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {TECH_STACK.map((t) => (
                  <Chip
                    key={t.label}
                    label={t.label}
                    color={t.color}
                    variant={t.color === 'default' ? 'outlined' : 'filled'}
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Open Source */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Open Source
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                MedAlarm is fully open source and available on GitHub. We welcome contributions,
                bug reports, and feature requests from the community.
              </Typography>
              <Link
                href="https://github.com/itok12/medalarm"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontWeight: 600 }}
              >
                github.com/itok12/medalarm →
              </Link>
            </CardContent>
          </Card>

          {/* Version */}
          <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
            <Typography variant="body2">
              MedAlarm v2.0 · MIT License
            </Typography>
            <Typography variant="caption">
              Made with ❤️ for patients, caregivers, and healthcare teams worldwide.
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
}

export default AboutPage;
