import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Divider,
  Snackbar, Alert, Fade, MenuItem, Select, FormControl, InputLabel,
  List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import BugReportIcon from '@mui/icons-material/BugReport';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import GitHubIcon from '@mui/icons-material/GitHub';
import Navbar from '../components/Layout/Navbar';

const FEEDBACK_TYPES = [
  { value: 'bug', label: '🐛 Bug Report', icon: <BugReportIcon color="error" fontSize="small" /> },
  { value: 'feature', label: '💡 Feature Request', icon: <LightbulbIcon color="warning" fontSize="small" /> },
  { value: 'general', label: '👍 General Feedback', icon: <ThumbUpIcon color="success" fontSize="small" /> },
  { value: 'other', label: '✉️ Other', icon: <EmailIcon color="primary" fontSize="small" /> },
];

const CONTACT_LINKS = [
  {
    icon: <GitHubIcon />,
    primary: 'GitHub Issues',
    secondary: 'Report bugs or request features on GitHub',
    href: 'https://github.com/itok12/medalarm/issues',
  },
  {
    icon: <GitHubIcon />,
    primary: 'GitHub Discussions',
    secondary: 'Ask questions, share ideas, or discuss improvements',
    href: 'https://github.com/itok12/medalarm/discussions',
  },
];

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', feedbackType: 'general', message: '' });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.message.trim()) errs.message = 'Message is required';
    else if (form.message.trim().length < 10) errs.message = 'Please provide at least 10 characters';
    return errs;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    // In a real app, this would call an API endpoint.
    // For now, we show a success message and log the feedback.
    console.info('Feedback submitted:', form);
    setSubmitted(true);
    setSnackbar({ open: true, message: 'Thank you! Your feedback has been recorded.', severity: 'success' });
  };

  const handleReset = () => {
    setForm({ name: '', email: '', feedbackType: 'general', message: '' });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Fade in timeout={400}>
        <Box sx={{ maxWidth: 700, mx: 'auto', p: { xs: 2, sm: 3 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              📬 Contact &amp; Feedback
            </Typography>
            <Typography color="text.secondary" variant="body2">
              We love hearing from you — report bugs, suggest features, or just say hello.
            </Typography>
          </Box>

          {!submitted ? (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Send Feedback
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
                >
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Your Name"
                      value={form.name}
                      onChange={handleChange('name')}
                      error={!!errors.name}
                      helperText={errors.name}
                      required
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                    <TextField
                      label="Your Email"
                      type="email"
                      value={form.email}
                      onChange={handleChange('email')}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                  </Box>

                  <FormControl fullWidth>
                    <InputLabel>Feedback Type</InputLabel>
                    <Select
                      value={form.feedbackType}
                      label="Feedback Type"
                      onChange={handleChange('feedbackType')}
                    >
                      {FEEDBACK_TYPES.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Your Message"
                    value={form.message}
                    onChange={handleChange('message')}
                    error={!!errors.message}
                    helperText={errors.message}
                    required
                    multiline
                    rows={5}
                    placeholder="Describe your feedback, bug, or idea in detail…"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<EmailIcon />}
                    sx={{ alignSelf: 'flex-start', minWidth: 160 }}
                  >
                    Send Feedback
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Fade in timeout={500}>
              <Card sx={{ mb: 3, borderColor: 'success.main', borderWidth: 2, borderStyle: 'solid' }}>
                <CardContent sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>🎉</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    Thank You!
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Your feedback has been recorded. We read every message and use it to improve
                    MedAlarm for everyone.
                  </Typography>
                  <Button variant="outlined" onClick={handleReset}>
                    Send Another Message
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Contact links */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Other Ways to Reach Us
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {CONTACT_LINKS.map((link, i) => (
                  <React.Fragment key={i}>
                    <ListItem
                      component="a"
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        borderRadius: 1,
                        px: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>{link.icon}</ListItemIcon>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 600 }}>{link.primary}</Typography>}
                        secondary={link.secondary}
                      />
                    </ListItem>
                    {i < CONTACT_LINKS.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ContactPage;
