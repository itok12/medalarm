import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  List, ListItem, ListItemText, ListItemButton, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Snackbar, Alert, CircularProgress
} from '@mui/material';
import Navbar from '../components/Layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { caregiverAPI } from '../services/api';

function CaregiverPage() {
  const { user } = useAuth();
  const userId = user?.userId;

  const [patients, setPatients] = useState([]);
  const [patientUsername, setPatientUsername] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientLogs, setPatientLogs] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showMsg = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const fetchPatients = useCallback(async () => {
    if (!userId) return;
    setLoadingPatients(true);
    try {
      const res = await caregiverAPI.getPatients(userId);
      setPatients(res.data ?? []);
    } catch {
      showMsg('Failed to load patients', 'error');
    } finally {
      setLoadingPatients(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      await caregiverAPI.addPatient(userId, patientUsername);
      showMsg(`Patient "${patientUsername}" added`);
      setPatientUsername('');
      fetchPatients();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add patient';
      showMsg(msg, 'error');
    }
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setLoadingLogs(true);
    try {
      const res = await caregiverAPI.getPatientLogs(patient.id, userId);
      setPatientLogs(res.data ?? []);
    } catch {
      showMsg('Failed to load patient logs', 'error');
      setPatientLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Caregiver Mode
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Add Patient</Typography>
            <Box component="form" onSubmit={handleAddPatient} sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Patient Username"
                value={patientUsername}
                onChange={(e) => setPatientUsername(e.target.value)}
                required
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <Button type="submit" variant="contained">Add</Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Your Patients ({patients.length})
            </Typography>
            {loadingPatients ? (
              <CircularProgress size={24} />
            ) : patients.length === 0 ? (
              <Typography color="text.secondary">No patients added yet.</Typography>
            ) : (
              <List dense>
                {patients.map((p, idx) => (
                  <React.Fragment key={p.id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        selected={selectedPatient?.id === p.id}
                        onClick={() => handleSelectPatient(p)}
                      >
                        <ListItemText
                          primary={p.username}
                          secondary={p.email || 'No email'}
                        />
                      </ListItemButton>
                    </ListItem>
                    {idx !== patients.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {selectedPatient && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Adherence Log — {selectedPatient.username}
              </Typography>
              {loadingLogs ? (
                <CircularProgress size={24} />
              ) : patientLogs.length === 0 ? (
                <Typography color="text.secondary">No logs found for this patient.</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Medicine</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {patientLogs.map((log) => {
                        const takenAt = log.takenAt ? new Date(log.takenAt) : null;
                        return (
                          <TableRow key={log.id}>
                            <TableCell>{takenAt ? takenAt.toLocaleDateString() : '—'}</TableCell>
                            <TableCell>{takenAt ? takenAt.toLocaleTimeString() : '—'}</TableCell>
                            <TableCell>
                              {log.alarm?.medicine?.name || '—'}
                            </TableCell>
                            <TableCell>{log.status}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CaregiverPage;
