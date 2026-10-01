import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  List, ListItem, ListItemText, ListItemButton, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Snackbar, Alert, CircularProgress, Chip, Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppScreen from '../components/Layout/AppScreen';
import { useAuth } from '../context/AuthContext';
import { caregiverAPI } from '../services/api';

const STATUS_LABEL = { PENDING: 'Waiting for approval', ACCEPTED: 'Sharing' };

function CaregiverPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [patientUsername, setPatientUsername] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientLogs, setPatientLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const isGuest = !!user?.guest;

  const showMsg = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const fetchLinks = useCallback(async () => {
    if (isGuest) return;
    setLoading(true);
    try {
      const [patientResponse, caregiverResponse] = await Promise.all([
        caregiverAPI.getPatients(),
        caregiverAPI.getCaregivers(),
      ]);
      setPatients(patientResponse.data ?? []);
      setCaregivers(caregiverResponse.data ?? []);
    } catch {
      showMsg('Failed to load caregiver links', 'error');
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const runAction = async (action, successMessage) => {
    try {
      await action();
      showMsg(successMessage);
      fetchLinks();
    } catch (error) {
      showMsg(error.response?.data?.error || 'Something went wrong', 'error');
    }
  };

  const handleRequestAccess = async (event) => {
    event.preventDefault();
    const username = patientUsername.trim();
    await runAction(
      () => caregiverAPI.addPatient(username),
      `Request sent. ${username} needs to approve it in their Care tab.`,
    );
    setPatientUsername('');
  };

  const handleRemovePatient = (patient) => {
    if (selectedPatient?.userId === patient.userId) setSelectedPatient(null);
    runAction(() => caregiverAPI.removePatient(patient.userId), `Removed ${patient.username}`);
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setLoadingLogs(true);
    try {
      const response = await caregiverAPI.getPatientLogs(patient.userId);
      setPatientLogs(response.data ?? []);
    } catch {
      showMsg('Failed to load patient logs', 'error');
      setPatientLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  if (isGuest) {
    return (
      <AppScreen
        title="Caregiver"
        subtitle="Share your medication history with someone you trust, or follow a family member's."
        maxWidth={950}
      >
        <Card>
          <CardContent>
            <Typography sx={{ mb: 2 }}>
              Caregiver sharing needs an account, so the other person can find you and you stay in control
              of who sees your history.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/login?sync=1')}>
              Sign in or create an account
            </Button>
          </CardContent>
        </Card>
      </AppScreen>
    );
  }

  const pendingRequests = caregivers.filter((link) => link.status === 'PENDING');
  const activeCaregivers = caregivers.filter((link) => link.status === 'ACCEPTED');

  return (
    <AppScreen
      title="Caregiver"
      subtitle="Nothing is shared until the patient approves a request, and they can stop sharing at any time."
      maxWidth={950}
    >
      <Box>
        {pendingRequests.length > 0 && (
          <Card sx={{ mb: 3, borderColor: 'warning.main' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Requests to see your history
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                If you approve, they can read your dose history (medicine names, times, taken or skipped).
              </Typography>
              <List dense>
                {pendingRequests.map((link) => (
                  <ListItem key={link.userId} disableGutters>
                    <ListItemText primary={link.username} />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => runAction(() => caregiverAPI.acceptCaregiver(link.userId), `${link.username} can now see your history`)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="inherit"
                        onClick={() => runAction(() => caregiverAPI.removeCaregiver(link.userId), 'Request declined')}
                      >
                        Decline
                      </Button>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              People who can see your history ({activeCaregivers.length})
            </Typography>
            {activeCaregivers.length === 0 ? (
              <Typography color="text.secondary">Nobody. Your history is private.</Typography>
            ) : (
              <List dense>
                {activeCaregivers.map((link) => (
                  <ListItem key={link.userId} disableGutters>
                    <ListItemText primary={link.username} />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => runAction(() => caregiverAPI.removeCaregiver(link.userId), `${link.username} can no longer see your history`)}
                    >
                      Stop sharing
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Follow a patient</Typography>
            <Box component="form" onSubmit={handleRequestAccess} sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Patient username"
                value={patientUsername}
                onChange={(event) => setPatientUsername(event.target.value)}
                required
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <Button type="submit" variant="contained">Send request</Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Your patients ({patients.length})
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : patients.length === 0 ? (
              <Typography color="text.secondary">No patients yet.</Typography>
            ) : (
              <List dense>
                {patients.map((patient, index) => (
                  <React.Fragment key={patient.userId}>
                    <ListItem
                      disablePadding
                      secondaryAction={(
                        <Button size="small" color="inherit" onClick={() => handleRemovePatient(patient)}>
                          Remove
                        </Button>
                      )}
                    >
                      <ListItemButton
                        selected={selectedPatient?.userId === patient.userId}
                        disabled={patient.status !== 'ACCEPTED'}
                        onClick={() => handleSelectPatient(patient)}
                      >
                        <ListItemText primary={patient.username} />
                        <Chip
                          size="small"
                          label={STATUS_LABEL[patient.status] || patient.status}
                          color={patient.status === 'ACCEPTED' ? 'success' : 'default'}
                          sx={{ mr: 9 }}
                        />
                      </ListItemButton>
                    </ListItem>
                    {index !== patients.length - 1 && <Divider />}
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
                Adherence Log - {selectedPatient.username}
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
                            <TableCell>{takenAt ? takenAt.toLocaleDateString() : '-'}</TableCell>
                            <TableCell>{takenAt ? takenAt.toLocaleTimeString() : '-'}</TableCell>
                            <TableCell>{log.medicineName || '-'}</TableCell>
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
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppScreen>
  );
}

export default CaregiverPage;
