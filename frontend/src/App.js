import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeContextProvider, useThemeMode } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { MedDataProvider } from './context/MedDataContext';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import TodayPage from './pages/TodayPage';
import MedicinesPage from './pages/MedicinesPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import CaregiverPage from './pages/CaregiverPage';
import HelpPage from './pages/HelpPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AppShell from './components/Layout/AppShell';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MedDataProvider>
              <AppShell />
            </MedDataProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<TodayPage />} />
        <Route path="medicines" element={<MedicinesPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="caregiver" element={<CaregiverPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ThemedApp() {
  const { mode } = useThemeMode();
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1565c0',
            light: '#5e92f3',
            dark: '#003c8f',
          },
          secondary: {
            main: '#00897b',
            light: '#4ebaaa',
            dark: '#005b4f',
          },
          background: {
            default: mode === 'dark' ? '#0f1923' : '#f0f4f8',
            paper: mode === 'dark' ? '#1a2535' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Manrope", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h5: { fontWeight: 800 },
          h6: { fontWeight: 700 },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
              root: ({ theme }) => ({
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 16,
              }),
            },
          },
          MuiButton: {
            styleOverrides: {
              root: { borderRadius: 10, textTransform: 'none', fontWeight: 600 },
              contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: ({ theme }) => ({
                background:
                  theme.palette.mode === 'dark'
                    ? '#1a2535'
                    : '#1565c0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              }),
            },
          },
          MuiTextField: {
            defaultProps: { size: 'small' },
          },
          MuiPaper: {
            styleOverrides: {
              root: { borderRadius: 16 },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <SettingsProvider>
          <ThemedApp />
        </SettingsProvider>
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;
