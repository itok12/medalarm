import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, CircularProgress, Button, Box } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { logAPI } from "../../services/api";

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function AdherenceChart({ userId }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    logAPI.getForUser(userId)
      .then((res) => {
        const logs = res.data ?? [];

        // Build map of last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push({ date: getDateKey(d), label: DAY_ABBR[d.getDay()], TAKEN: 0, SKIPPED: 0 });
        }

        logs.forEach((log) => {
          const dayKey = log.takenAt?.slice(0, 10);
          const entry = days.find((d) => d.date === dayKey);
          if (entry && (log.status === "TAKEN" || log.status === "SKIPPED")) {
            entry[log.status] = (entry[log.status] || 0) + 1;
          }
        });

        setChartData(days);
      })
      .catch((e) => console.error("Failed to load logs:", e))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleExportCSV = async () => {
    try {
      const response = await logAPI.exportCSV(userId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "adherence-log.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    }
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            📊 Adherence (Last 7 Days)
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </Box>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="TAKEN" fill="#4caf50" name="Taken" />
              <Bar dataKey="SKIPPED" fill="#f44336" name="Skipped" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default AdherenceChart;
