import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CircularProgress, Button, Box, Tooltip as MuiTooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import BarChartIcon from '@mui/icons-material/BarChart';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { logAPI } from '../../services/api';
import { buildAdherenceChartData } from '../../utils/adherenceChart';

function AdherenceChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    logAPI.getMine()
      .then((response) => setChartData(buildAdherenceChartData(response.data ?? [])))
      .catch((error) => console.error('Failed to load logs:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await logAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'adherence-log.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const hasData = chartData.some((day) => day.TAKEN > 0 || day.SKIPPED > 0);

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Adherence (Last 7 Days)
          </Typography>
          <MuiTooltip title="Download adherence log as CSV">
            <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
              Export CSV
            </Button>
          </MuiTooltip>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : !hasData ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <BarChartIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
            <Typography variant="body2">No adherence data yet.</Typography>
            <Typography variant="caption">Start marking doses as Taken or Skipped to see your chart.</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={chartData} barSize={20}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
              <Tooltip />
              <Legend />
              <Bar dataKey="TAKEN" fill="#2e7d32" name="Taken" radius={[4, 4, 0, 0]} />
              <Bar dataKey="SKIPPED" fill="#c62828" name="Skipped" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default AdherenceChart;
