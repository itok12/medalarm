import React from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AppScreen from '../components/Layout/AppScreen';
import AdherenceChart from '../components/Dashboard/AdherenceChart';
import { useMedData } from '../context/MedDataContext';

function HistoryPage() {
  const { logs, loading, offline } = useMedData();
  const recentLogs = [...logs]
    .sort((left, right) => new Date(right.takenAt).getTime() - new Date(left.takenAt).getTime())
    .slice(0, 12);

  return (
    <AppScreen
      title="History"
      subtitle="Track adherence trends and recent dose activity without digging through dashboards."
    >
      <Box sx={{ display: 'grid', gap: 3 }}>
        {offline && (
          <Alert severity="warning">
            History is being shown from local cache until the connection comes back.
          </Alert>
        )}

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TimelineIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Adherence trend
              </Typography>
            </Box>
            <AdherenceChart logs={logs} loading={loading} embedded />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EventNoteIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Recent activity
              </Typography>
            </Box>

            {!recentLogs.length ? (
              <Alert severity="info">Your medication activity will appear here once you start logging doses.</Alert>
            ) : (
              <List disablePadding>
                {recentLogs.map((log, index) => {
                  const takenAt = log.takenAt ? new Date(log.takenAt) : null;
                  return (
                    <React.Fragment key={log.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={log.medicineName || 'Medication'}
                          secondary={takenAt ? takenAt.toLocaleString() : 'Unknown time'}
                        />
                        <Chip
                          label={log.status}
                          color={log.status === 'TAKEN' ? 'success' : log.status === 'SKIPPED' ? 'error' : 'warning'}
                          size="small"
                          variant="outlined"
                        />
                      </ListItem>
                      {index !== recentLogs.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </AppScreen>
  );
}

export default HistoryPage;
