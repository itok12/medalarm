import React from 'react';
import {
  Box, Card, CardContent, Typography, Accordion, AccordionSummary,
  AccordionDetails, Divider, Link
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
    a: 'Go to the Profile page (top-right navigation). You can update your password or email after confirming your current password.',
  },
  {
    q: 'Can I use this on my phone?',
    a: 'Yes! MedAlarm is a Progressive Web App (PWA). Open it in Chrome on your phone and tap "Add to Home Screen" for a native app-like experience.',
  },
  {
    q: 'Are my alarms active when the browser is closed?',
    a: 'Browser notifications only work while the page is open. For always-on reminders, consider adding the app to your home screen as a PWA, or enable email reminders (if configured by your admin).',
  },
];

function HelpPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
          Help &amp; About
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Everything you need to know about MedAlarm.
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              💊 About MedAlarm
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ mb: 1 }}>
              MedAlarm is a free, open-source medicine reminder application that helps you and your
              caregivers manage medications and never miss a dose.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Built with Spring Boot (backend) and React + Material UI (frontend).{' '}
              <Link href="https://github.com/itok12/medalarm" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </Link>
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Frequently Asked Questions
        </Typography>

        {FAQ.map((item, idx) => (
          <Accordion key={idx} disableGutters>
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
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Quick Tips
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {[
                'Allow browser notifications when prompted so alarms fire correctly.',
                'Set a start date and duration on medicines so the app can track course end-dates.',
                'Use repeat days on alarms to schedule doses on specific days of the week.',
                'Export your CSV log before doctor appointments to share your adherence history.',
                'Toggle alarms off instead of deleting them — you can easily re-enable them later.',
              ].map((tip, i) => (
                <li key={i}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {tip}
                  </Typography>
                </li>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default HelpPage;
