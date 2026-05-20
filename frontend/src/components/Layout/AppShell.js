import React, { useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import MedicationIcon from '@mui/icons-material/Medication';
import InsightsIcon from '@mui/icons-material/Insights';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PersonIcon from '@mui/icons-material/Person';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useMedData } from '../../context/MedDataContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { authAPI } from '../../services/api';
import { isNativeMobilePlatform } from '../../services/nativePlatform';
import { syncNativeAlarmNotifications } from '../../services/reminderService';
import PwaInstallPrompt from '../Common/PwaInstallPrompt';
import AlarmNotifier from '../Alarm/AlarmNotifier';
import OnboardingDialog from '../Onboarding/OnboardingDialog';
import { captureException, trackEvent } from '../../services/telemetry';

const PRIMARY_NAV_ITEMS = [
  { label: 'Today', path: '/', icon: <TodayIcon /> },
  { label: 'Medicines', path: '/medicines', icon: <MedicationIcon /> },
  { label: 'History', path: '/history', icon: <InsightsIcon /> },
  { label: 'Care', path: '/caregiver', icon: <GroupIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

const MORE_ITEMS = [
  { label: 'Profile', path: '/profile', icon: <PersonIcon fontSize="small" /> },
  { label: 'Privacy', path: '/privacy', icon: <GavelOutlinedIcon fontSize="small" /> },
];

function getCurrentPrimaryPath(pathname) {
  const match = PRIMARY_NAV_ITEMS.find((item) => item.path !== '/' && pathname.startsWith(item.path));
  return match?.path || '/';
}

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const { medicines, alarms, offline, refreshing, refreshAll } = useMedData();
  const { shouldShowChecklist } = useOnboarding();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const currentPrimaryPath = useMemo(
    () => getCurrentPrimaryPath(location.pathname),
    [location.pathname]
  );

  useEffect(() => {
    if (!isNativeMobilePlatform()) {
      return undefined;
    }

    SplashScreen.hide().catch(() => {});
    StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});

    const listenerPromise = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        refreshAll({ background: true });
      }
    });

    return () => {
      listenerPromise.then((listener) => listener.remove()).catch(() => {});
    };
  }, [refreshAll]);

  useEffect(() => {
    syncNativeAlarmNotifications(alarms, medicines).catch((error) => {
      captureException(error, { source: 'AppShell.syncNativeAlarmNotifications' });
    });
  }, [alarms, medicines]);

  const handleLogout = async () => {
    if (!user?.guest) {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }
    logout();
    trackEvent('logout');
    setMenuAnchor(null);
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          bgcolor: 'background.paper',
          borderBottom: (muiTheme) => `1px solid ${muiTheme.palette.divider}`,
          color: 'text.primary',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                background: 'linear-gradient(135deg, #0d47a1 0%, #00897b 100%)',
                fontWeight: 900,
              }}
            >
              M
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1 }}>
                MedAlarm
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.username
                  ? shouldShowChecklist
                    ? 'Finish setup for reliable reminders'
                    : `Welcome back, ${user.username}`
                  : 'Your dose, on time'}
              </Typography>
            </Box>
          </Box>

          {isDesktop && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 3 }}>
              {PRIMARY_NAV_ITEMS.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  startIcon={item.icon}
                  color={currentPrimaryPath === item.path ? 'primary' : 'inherit'}
                  variant={currentPrimaryPath === item.path ? 'contained' : 'text'}
                  sx={{ minWidth: 'auto' }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {offline && (
            <Chip
              label="Offline view"
              color="warning"
              size="small"
              variant="outlined"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            />
          )}
          {refreshing && (
            <Chip
              label="Syncing"
              color="primary"
              size="small"
              variant="outlined"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            />
          )}

          <IconButton onClick={toggleMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton color="inherit" onClick={(event) => setMenuAnchor(event.currentTarget)}>
            <MoreHorizIcon />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={!!menuAnchor}
            onClose={() => setMenuAnchor(null)}
            keepMounted
          >
            {MORE_ITEMS.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => {
                  setMenuAnchor(null);
                  navigate(item.path);
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  {item.icon}
                  {item.label}
                </Box>
              </MenuItem>
            ))}
            <MenuItem onClick={handleLogout}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'error.main' }}>
                <LogoutIcon fontSize="small" />
                Logout
              </Box>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {user?.guest && (
        <Box
          sx={{
            bgcolor: 'secondary.main',
            color: '#fff',
            py: 0.6,
            px: 2,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.92 }}>
            Your data is saved on this device only.
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate('/login?sync=1')}
            sx={{
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.6)',
              py: 0.2,
              fontSize: '0.7rem',
              '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Sign in to sync
          </Button>
        </Box>
      )}

      <Box sx={{ pb: { xs: 'calc(84px + env(safe-area-inset-bottom))', md: 4 } }}>
        <Outlet />
      </Box>

      {!isDesktop && (
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            left: 12,
            right: 12,
            bottom: 'calc(12px + env(safe-area-inset-bottom))',
            borderRadius: 4,
            overflow: 'hidden',
            zIndex: (muiTheme) => muiTheme.zIndex.appBar,
          }}
        >
          <BottomNavigation
            value={currentPrimaryPath}
            onChange={(_, nextValue) => navigate(nextValue)}
            showLabels
          >
            {PRIMARY_NAV_ITEMS.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                value={item.path}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}

      <AlarmNotifier alarms={alarms} medicines={medicines} />
      <OnboardingDialog />
      <PwaInstallPrompt />
    </Box>
  );
}

export default AppShell;
