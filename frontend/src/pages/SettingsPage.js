import React, { useEffect, useState } from 'react';
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
import PublicIcon from '@mui/icons-material/Public';
import AppScreen from '../components/Layout/AppScreen';
import { useSettings } from '../context/SettingsContext';
import { useThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

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

function normalizeTime(value) {
  if (!value) return '08:00';
  return String(value).slice(0, 5);
}

function SettingsPage() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { mode, toggleMode } = useThemeMode();
  const { user, updateUserFromProfile } = useAuth();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [timezoneInput, setTimezoneInput] = useState(user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    setTimezoneInput(user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, [user?.timezone]);

  const showMsg = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const saveServerSettings = async (payload, successMessage) => {
    try {
      const response = await userAPI.updateMe(payload);
      updateUserFromProfile(response.data);
      showMsg(successMessage);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to save server setting';
      showMsg(message, 'error');
    }
  };

  const handleReset = async () => {
    resetSettings();
    await saveServerSettings(
      {
        emailRemindersEnabled: false,
        defaultAlarmTime: '08:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      'Settings reset to defaults',
    );
  };

  return (
    <AppScreen
      title="Settings"
      subtitle="Tune reminders, appearance, and regional preferences for each device and account."
      maxWidth={760}
    >
      <Fade in timeout={400}>
        <Box>
          <SettingSection icon={<NotificationsIcon />} title="Notifications">
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <NotificationsIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Notification Sound"
                  secondary="Play a sound when an alarm fires on this device"
                />
                <FormControlLabel
                  control={(
                    <Switch
                      checked={settings.notificationSound}
                      onChange={(event) => updateSetting('notificationSound', event.target.checked)}
                      color="primary"
                    />
                  )}
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
                  secondary="Receive reminder emails when the backend mail service is enabled"
                />
                <FormControlLabel
                  control={(
                    <Switch
                      checked={!!user?.emailRemindersEnabled}
                      onChange={(event) =>
                        saveServerSettings(
                          { emailRemindersEnabled: event.target.checked },
                          'Email reminder preference updated',
                        )}
                      color="primary"
                    />
                  )}
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
                  secondary="How long to delay an alarm when snoozed on this device"
                />
                <Box sx={{ width: '100%', pl: 4.5 }}>
                  <Slider
                    value={settings.snoozeDurationMinutes}
                    onChange={(_, value) => updateSetting('snoozeDurationMinutes', value)}
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

          <SettingSection icon={<MusicNoteIcon />} title="Alarm Preferences">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Alarm Tone</InputLabel>
                <Select
                  value={settings.alarmTone}
                  label="Alarm Tone"
                  onChange={(event) => updateSetting('alarmTone', event.target.value)}
                >
                  {ALARM_TONES.map((tone) => (
                    <MenuItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Default Alarm Time"
                type="time"
                value={normalizeTime(user?.defaultAlarmTime)}
                onChange={(event) =>
                  saveServerSettings(
                    { defaultAlarmTime: event.target.value },
                    'Default alarm time updated',
                  )}
                size="small"
                InputLabelProps={{ shrink: true }}
                helperText="Used as the starting point for auto-generated schedules"
              />
            </Box>
          </SettingSection>

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
                  control={<Switch checked={mode === 'dark'} onChange={toggleMode} color="primary" />}
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
                  control={(
                    <Switch
                      checked={settings.compactView}
                      onChange={(event) => updateSetting('compactView', event.target.checked)}
                      color="primary"
                    />
                  )}
                  label=""
                />
              </ListItem>
            </List>
          </SettingSection>

          <SettingSection icon={<CalendarTodayIcon />} title="Regional">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={settings.dateFormat}
                  label="Date Format"
                  onChange={(event) => updateSetting('dateFormat', event.target.value)}
                >
                  {DATE_FORMATS.map((format) => (
                    <MenuItem key={format.value} value={format.value}>
                      {format.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Timezone"
                size="small"
                value={timezoneInput}
                onChange={(event) => setTimezoneInput(event.target.value)}
                onBlur={() => {
                  if (timezoneInput && timezoneInput !== user?.timezone) {
                    saveServerSettings({ timezone: timezoneInput }, 'Timezone updated');
                  }
                }}
                helperText="Use an IANA timezone such as Europe/London or America/New_York"
                InputProps={{
                  startAdornment: <PublicIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Box>
          </SettingSection>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => showMsg('Local settings save automatically and server settings save as you change them')}
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

export default SettingsPage;
