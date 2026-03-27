import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Switch, FormControlLabel, Divider,
  Select, MenuItem, FormControl, InputLabel, Button, Snackbar, Alert,
  Slider, TextField, Fade, List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaletteIcon from '@mui/icons-material/Palette';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import EmailIcon from '@mui/icons-material/Email';
import RestoreIcon from '@mui/icons-material/Restore';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Navbar from '../components/Layout/Navbar';
import { useSettings } from '../context/SettingsContext';
import { useThemeMode } from '../context/ThemeContext';

const ALARM_TONES = [
  { value: 'default', label: 'Default Beep' },
  { value: 'gentle', label: 'Gentle Chime' },
  { value: 'urgent', label: 'Urgent Alert' },
  { value: 'melody', label: 'Soft Melody' },
  { value: 'digital', label: 'Digital Buzz' },
];

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
];

function SettingSection({ icon, title, children }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ color: 'primary.main' }}>{icon}</Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );
}

function SettingsPage() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { mode, toggleMode } = useThemeMode();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showMsg = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handleReset = () => {
    resetSettings();
    showMsg('Settings reset to defaults');
  };

  const handleSave = () => {
    // Settings are persisted automatically on each change via updateSetting.
    // This button serves as a visual confirmation for the user.
    showMsg('All settings are saved automatically as you change them');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Fade in timeout={400}>
        <Box sx={{ maxWidth: 700, mx: 'auto', p: { xs: 2, sm: 3 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              ⚙️ Settings
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Customize MedAlarm to suit your preferences.
            </Typography>
          </Box>

          {/* Notifications */}
          <SettingSection icon={<NotificationsIcon />} title="Notifications">
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <NotificationsIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Notification Sound"
                  secondary="Play a sound when an alarm fires"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notificationSound}
                      onChange={(e) => updateSetting('notificationSound', e.target.checked)}
                      color="primary"
                    />
                  }
                  label=""
                />
              </ListItem>
              <Divider component="li" />
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <EmailIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Email Reminders"
                  secondary="Receive email notifications for missed doses (requires server configuration)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailReminders}
                      onChange={(e) => updateSetting('emailReminders', e.target.checked)}
                      color="primary"
                    />
                  }
                  label=""
                />
              </ListItem>
              <Divider component="li" />
              <ListItem disableGutters sx={{ flexWrap: 'wrap', gap: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <AccessTimeIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={`Snooze Duration: ${settings.snoozeDurationMinutes} minutes`}
                  secondary="How long to delay an alarm when snoozed"
                />
                <Box sx={{ width: '100%', pl: 4.5 }}>
                  <Slider
                    value={settings.snoozeDurationMinutes}
                    onChange={(_, val) => updateSetting('snoozeDurationMinutes', val)}
                    min={1}
                    max={30}
                    step={1}
                    marks={[
                      { value: 5, label: '5m' },
                      { value: 10, label: '10m' },
                      { value: 15, label: '15m' },
                      { value: 30, label: '30m' },
                    ]}
                    valueLabelDisplay="auto"
                    sx={{ maxWidth: 400 }}
                  />
                </Box>
              </ListItem>
            </List>
          </SettingSection>

          {/* Alarm Preferences */}
          <SettingSection icon={<MusicNoteIcon />} title="Alarm Preferences">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Alarm Tone</InputLabel>
                <Select
                  value={settings.alarmTone}
                  label="Alarm Tone"
                  onChange={(e) => updateSetting('alarmTone', e.target.value)}
                >
                  {ALARM_TONES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Default Alarm Time"
                type="time"
                value={settings.defaultAlarmTime}
                onChange={(e) => updateSetting('defaultAlarmTime', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                helperText="Pre-fill this time when creating new alarms"
              />
            </Box>
          </SettingSection>

          {/* Appearance */}
          <SettingSection icon={<PaletteIcon />} title="Appearance">
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PaletteIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Dark Mode"
                  secondary={`Currently using ${mode} theme`}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === 'dark'}
                      onChange={toggleMode}
                      color="primary"
                    />
                  }
                  label=""
                />
              </ListItem>
              <Divider component="li" />
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ViewCompactIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Compact View"
                  secondary="Show more items with reduced spacing"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compactView}
                      onChange={(e) => updateSetting('compactView', e.target.checked)}
                      color="primary"
                    />
                  }
                  label=""
                />
              </ListItem>
            </List>
          </SettingSection>

          {/* Regional */}
          <SettingSection icon={<CalendarTodayIcon />} title="Regional">
            <FormControl fullWidth size="small">
              <InputLabel>Date Format</InputLabel>
              <Select
                value={settings.dateFormat}
                label="Date Format"
                onChange={(e) => updateSetting('dateFormat', e.target.value)}
              >
                {DATE_FORMATS.map((f) => (
                  <MenuItem key={f.value} value={f.value}>
                    {f.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </SettingSection>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSave}
              sx={{ minWidth: 140 }}
            >
              Save Settings
            </Button>
            <Button
              variant="outlined"
              size="large"
              color="inherit"
              startIcon={<RestoreIcon />}
              onClick={handleReset}
              sx={{ minWidth: 140 }}
            >
              Reset Defaults
            </Button>
          </Box>
        </Box>
      </Fade>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
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

export default SettingsPage;
