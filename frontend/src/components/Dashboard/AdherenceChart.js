import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
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

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          📊 Adherence (Last 7 Days)
        </Typography>
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
