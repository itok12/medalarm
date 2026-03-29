import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { captureException } from '../../services/telemetry';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    captureException(error, {
      source: 'react.error_boundary',
      componentStack: info.componentStack,
    });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Paper
          sx={{
            maxWidth: 520,
            width: '100%',
            p: 4,
            textAlign: 'center',
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <WarningAmberRoundedIcon color="warning" sx={{ fontSize: 42, mb: 1.5 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            MedAlarm hit an unexpected problem
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            The issue has been captured. Reload the app to get back to your reminders.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload App
          </Button>
        </Paper>
      </Box>
    );
  }
}

export default AppErrorBoundary;
