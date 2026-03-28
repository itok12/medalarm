import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip,
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, useMediaQuery, useTheme,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EmailIcon from '@mui/icons-material/Email';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Caregiver', path: '/caregiver', icon: <GroupIcon fontSize="small" /> },
  { label: 'Profile', path: '/profile', icon: <PersonIcon fontSize="small" /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon fontSize="small" /> },
  { label: 'Help', path: '/help', icon: <HelpOutlineIcon fontSize="small" /> },
  { label: 'About', path: '/about', icon: <InfoOutlinedIcon fontSize="small" /> },
  { label: 'Contact', path: '/contact', icon: <EmailIcon fontSize="small" /> },
];

function Navbar() {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout request failed:', error);
    }
    logout();
    navigate('/login');
    setDrawerOpen(false);
  };

  const handleNav = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, cursor: 'pointer', letterSpacing: '-0.3px', mr: 1 }}
            onClick={() => navigate('/')}
          >
            MedAlarm
          </Typography>

          {user && !isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1 }}>
              {NAV_ITEMS.slice(1, 5).map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  size="small"
                  onClick={() => handleNav(item.path)}
                  sx={{
                    fontWeight: isActive(item.path) ? 700 : 500,
                    opacity: isActive(item.path) ? 1 : 0.85,
                    borderBottom: isActive(item.path) ? '2px solid #fff' : '2px solid transparent',
                    borderRadius: 0,
                    px: 1.5,
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {!isMobile && (
                <Typography variant="body2" sx={{ opacity: 0.9, mr: 0.5 }}>
                  Hello, <strong>{user.username}</strong>
                </Typography>
              )}

              <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                <IconButton color="inherit" onClick={toggleMode} size="small">
                  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>

              {isMobile ? (
                <IconButton color="inherit" onClick={() => setDrawerOpen(true)} size="small">
                  <MenuIcon />
                </IconButton>
              ) : (
                <Button
                  color="inherit"
                  variant="outlined"
                  size="small"
                  startIcon={<LogoutIcon fontSize="small" />}
                  onClick={handleLogout}
                  sx={{ ml: 1, borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff' } }}
                >
                  Logout
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 260 } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            MedAlarm
          </Typography>
          {user && (
            <Typography variant="body2" color="text.secondary">
              Signed in as <strong>{user.username}</strong>
            </Typography>
          )}
        </Box>
        <Divider />
        <List dense>
          {NAV_ITEMS.map((item) => (
            <ListItem disablePadding key={item.path}>
              <ListItemButton
                onClick={() => handleNav(item.path)}
                selected={isActive(item.path)}
                sx={{ borderRadius: 1, mx: 1, my: 0.25 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List dense>
          <ListItem disablePadding>
            <ListItemButton onClick={toggleMode} sx={{ borderRadius: 1, mx: 1, my: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              </ListItemIcon>
              <ListItemText primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1, mx: 1, my: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}

export default Navbar;
