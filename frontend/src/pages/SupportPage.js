import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import AppScreen from '../components/Layout/AppScreen';

const SUPPORT_OPTIONS = [
  {
    title: 'Bug reports',
    body: 'Use the contact screen or GitHub Issues when a reminder, sync flow, or mobile behavior feels wrong.',
    href: 'https://github.com/itok12/medalarm/issues',
  },
  {
    title: 'Feature requests',
    body: 'Share ideas for routines, caregiver flows, or reminder quality improvements in GitHub Discussions.',
    href: 'https://github.com/itok12/medalarm/discussions',
  },
  {
    title: 'Account help',
    body: 'If you are locked out, use the contact page inside the app and include your username and device details.',
    href: '/contact',
  },
];

function SupportPage() {
  return (
    <AppScreen
      title="Support"
      subtitle="Where to go when you need help, want to report a problem, or need a clean support URL for app stores."
      maxWidth={820}
    >
      <Box sx={{ display: 'grid', gap: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SupportAgentOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Support response guide
              </Typography>
            </Box>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
              MedAlarm support is designed around quick diagnosis. When you report an issue, include
              your platform, app version, timezone, whether notifications were enabled, and what you expected to happen.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Best places to reach us
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List disablePadding>
              {SUPPORT_OPTIONS.map((item, index) => (
                <React.Fragment key={item.title}>
                  <ListItem
                    component="a"
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    sx={{ px: 0, textDecoration: 'none', color: 'inherit' }}
                  >
                    <ListItemText
                      primary={<Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>}
                      secondary={item.body}
                    />
                  </ListItem>
                  {index < SUPPORT_OPTIONS.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Direct support email: <Link href="mailto:support@medalarmapp.com">support@medalarmapp.com</Link>
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <BugReportOutlinedIcon color="warning" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Best support ticket format
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Include the medicine name, scheduled time, expected notification behavior, actual behavior,
              and whether the app was foregrounded, backgrounded, or closed.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AutoAwesomeOutlinedIcon color="secondary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Store support URL
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              For App Store Connect or Play Console support metadata, use{' '}
              <Link href="/support.html" target="_blank" rel="noopener noreferrer">
                /support.html
              </Link>{' '}
              on your deployed frontend domain.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Primary support website: <Link href="https://medalarmapp.com/support.html" target="_blank" rel="noopener noreferrer">medalarmapp.com/support.html</Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </AppScreen>
  );
}

export default SupportPage;
