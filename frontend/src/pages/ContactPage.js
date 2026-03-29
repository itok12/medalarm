import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Fade,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  TextField,
  Typography,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import BugReportIcon from '@mui/icons-material/BugReport';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import GitHubIcon from '@mui/icons-material/GitHub';
import AppScreen from '../components/Layout/AppScreen';

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug report', icon: <BugReportIcon color="error" fontSize="small" /> },
  { value: 'feature', label: 'Feature request', icon: <LightbulbIcon color="warning" fontSize="small" /> },
  { value: 'general', label: 'General feedback', icon: <ThumbUpIcon color="success" fontSize="small" /> },
  { value: 'other', label: 'Other', icon: <EmailIcon color="primary" fontSize="small" /> },
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
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = 'Enter a valid email address';
    if (!form.message.trim()) nextErrors.message = 'Message is required';
    else if (form.message.trim().length < 10) nextErrors.message = 'Please provide at least 10 characters';
    return nextErrors;
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    console.info('Feedback submitted:', form);
    setSubmitted(true);
    setSnackbar({ open: true, message: 'Thank you. Your feedback has been recorded.', severity: 'success' });
  };

  const handleReset = () => {
    setForm({ name: '', email: '', feedbackType: 'general', message: '' });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <AppScreen
      title="Contact & Feedback"
      subtitle="Share bugs, ideas, or general feedback that can help MedAlarm improve."
      maxWidth={760}
    >
      <Fade in timeout={400}>
        <Box>
          {!submitted ? (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Send feedback
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                      {FEEDBACK_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
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
                    placeholder="Describe the issue, idea, or feedback in a bit of detail."
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<EmailIcon />}
                    sx={{ alignSelf: 'flex-start', minWidth: 160 }}
                  >
                    Send feedback
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Fade in timeout={500}>
              <Card sx={{ mb: 3, borderColor: 'success.main', borderWidth: 2, borderStyle: 'solid' }}>
                <CardContent sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    Thank you
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Your feedback has been recorded. We read every message and use it to improve MedAlarm.
                  </Typography>
                  <Button variant="outlined" onClick={handleReset}>
                    Send another message
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          )}

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Other ways to reach us
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {CONTACT_LINKS.map((link, index) => (
                  <React.Fragment key={link.primary}>
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
                    {index < CONTACT_LINKS.length - 1 && <Divider component="li" />}
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
        onClose={() => setSnackbar((state) => ({ ...state, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((state) => ({ ...state, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppScreen>
  );
}

export default ContactPage;
