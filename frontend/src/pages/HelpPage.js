import React from 'react';
import {
  Box, Card, CardContent, Typography, Accordion, AccordionSummary,
  AccordionDetails, Divider, Link, Button, Fade,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';

const FAQ = [
  {
    q: 'How do I add a medicine?',
    a: 'On the Dashboard, fill in the "Add Medicine" form with the medicine name, dosage, and frequency, then click "Add". Alarms can be auto-generated from the medicine\'s frequency.',
  },
  {
    q: 'How do alarms work?',
    a: 'Alarms fire at the scheduled time and show a browser notification (you must grant permission). You can mark the dose as "Taken", "Skipped", or "Snooze" it for 10 minutes.',
  },
  {
    q: 'What does the adherence chart show?',
    a: 'The chart shows how many doses you took vs. skipped in the past 7 days, helping you track your medication adherence over time.',
  },
  {
    q: 'How do I export my medication log?',
    a: 'Click "Export CSV" on the Adherence chart. This downloads a CSV file you can open in Excel or share with your doctor.',
  },
  {
    q: 'What is Caregiver Mode?',
    a: 'Caregiver Mode lets you monitor another user\'s adherence. Go to the Caregiver page, enter their username, and once added you can view their medication log.',
  },
  {
    q: 'How do I change my password or email?',
    a: 'Go to the Profile page (accessible via the top navigation). You can update your password or email after confirming your current password.',
  },
  {
    q: 'Can I use this on my phone?',
    a: 'Yes! MedAlarm is a Progressive Web App (PWA). Open it in Chrome on your phone and tap "Add to Home Screen" for a native app-like experience.',
  },
  {
    q: 'Are my alarms active when the browser is closed?',
    a: 'Browser notifications only work while the page is open. For always-on reminders, consider adding the app to your home screen as a PWA, or enable email reminders (if configured by your admin).',
  },
  {
    q: 'How do I change notification settings?',
    a: 'Go to the Settings page from the navigation menu. You can adjust snooze duration, alarm tones, notification sounds, and other preferences.',
  },
];

const TIPS = [
  'Allow browser notifications when prompted so alarms fire correctly.',
  'Set a start date and duration on medicines so the app can track course end-dates.',
  'Use repeat days on alarms to schedule doses on specific days of the week.',
  'Export your CSV log before doctor appointments to share your adherence history.',
  'Toggle alarms off instead of deleting them — you can easily re-enable them later.',
  'Use the Settings page to customize your snooze duration and alarm tone.',
];

function HelpPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Fade in timeout={400}>
        <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 3 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              ❓ Help &amp; FAQ
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Find answers to common questions and useful tips for using MedAlarm.
            </Typography>
          </Box>

          {/* Quick links */}
          <Card sx={{ mb: 3, bgcolor: 'primary.main', color: '#fff' }}>
            <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Need more info?
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Learn about the app or send us your feedback.
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

          {/* FAQ */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ContactSupportOutlinedIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Frequently Asked Questions
            </Typography>
          </Box>

          {FAQ.map((item, idx) => (
            <Accordion key={idx} disableGutters sx={{ mb: 0.5 }}>
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

          {/* Tips */}
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
                {TIPS.map((tip, i) => (
                  <li key={i}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                      {tip}
                    </Typography>
                  </li>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Open source */}
          <Box sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">
              MedAlarm is open source —{' '}
              <Link href="https://github.com/itok12/medalarm" target="_blank" rel="noopener noreferrer">
                view on GitHub
              </Link>
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
}

export default HelpPage;
