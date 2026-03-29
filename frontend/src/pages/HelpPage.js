import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Link,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { useNavigate } from 'react-router-dom';
import AppScreen from '../components/Layout/AppScreen';

const FAQ = [
  {
    q: 'How do I add a medicine?',
    a: 'Open Medicines, add the name, dosage, and frequency, then save. MedAlarm can generate alarms automatically from that schedule.',
  },
  {
    q: 'How do alarms work?',
    a: 'Alarms are generated from your medicine schedule or created manually. On mobile, MedAlarm schedules native reminders. On the web, reminders work while the app is open.',
  },
  {
    q: 'What does the adherence chart show?',
    a: 'The chart tracks taken and skipped doses across the last seven days so you can spot trends quickly.',
  },
  {
    q: 'How do I export my medication log?',
    a: 'Open History and use Export CSV to download your adherence record.',
  },
  {
    q: 'What is Caregiver Mode?',
    a: 'Caregiver Mode lets you add a patient by username and review their adherence history with read-only access.',
  },
  {
    q: 'Can I use this on my phone?',
    a: 'Yes. MedAlarm now includes a native mobile foundation using Capacitor for iOS and Android plus installable web support.',
  },
];

const TIPS = [
  'Enable reminders after sign-in so your schedules can fire on time.',
  'Set an end date for short treatment courses so alarms stop automatically.',
  'Use snooze for short delays instead of skipping a dose outright.',
  'Check History before appointments to review adherence patterns.',
];

function HelpPage() {
  const navigate = useNavigate();

  return (
    <AppScreen
      title="Help & FAQ"
      subtitle="Find answers to common questions and practical tips for getting the most out of MedAlarm."
      maxWidth={860}
    >
      <Fade in timeout={400}>
        <Box>
          <Card sx={{ mb: 3, bgcolor: 'primary.main', color: '#fff' }}>
            <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Need more context?
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Learn more about MedAlarm or send feedback to help shape the product.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/about')}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                  startIcon={<InfoOutlinedIcon fontSize="small" />}
                >
                  About
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/contact')}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                  startIcon={<ContactSupportOutlinedIcon fontSize="small" />}
                >
                  Contact
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ContactSupportOutlinedIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Frequently Asked Questions
            </Typography>
          </Box>

          {FAQ.map((item) => (
            <Accordion key={item.q} disableGutters sx={{ mb: 0.75 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>{item.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TipsAndUpdatesOutlinedIcon color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Quick Tips
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {TIPS.map((tip) => (
                  <li key={tip}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                      {tip}
                    </Typography>
                  </li>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">
              MedAlarm is open source.{' '}
              <Link href="https://github.com/itok12/medalarm" target="_blank" rel="noopener noreferrer">
                View the project on GitHub
              </Link>
            </Typography>
          </Box>
        </Box>
      </Fade>
    </AppScreen>
  );
}

export default HelpPage;
