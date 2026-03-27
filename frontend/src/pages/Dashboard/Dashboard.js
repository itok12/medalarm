import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Grid, Alert, Box, Typography, Card, CardContent, CircularProgress
} from "@mui/material";
import Navbar from "../../components/Layout/Navbar";
import MedicineList from "../../components/Medicine/MedicineList";
import MedicineForm from "../../components/Medicine/MedicineForm";
import AlarmList from "../../components/Alarm/AlarmList";
import CreateAlarmForm from "../../components/Alarm/CreateAlarmForm";
import AlarmNotifier from "../../components/Alarm/AlarmNotifier";
import AdherenceChart from "../../components/Dashboard/AdherenceChart";
import NextAlarmCard from "../../components/Dashboard/NextAlarmCard";
import { medicineAPI, alarmAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const DAYS_OF_WEEK = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user } = useAuth();
  const userId = user?.userId;

  const [medicines, setMedicines] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const medNameById = useMemo(() => {
    const map = new Map();
    medicines.forEach((m) => map.set(m.id, m.name));
    return map;
  }, [medicines]);

  const refreshAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setPageError("");
    try {
      const [medRes, alarmRes] = await Promise.all([
        medicineAPI.getAll(userId),
        alarmAPI.getUserAlarms(userId),
      ]);
      setMedicines(medRes.data ?? []);
      setAlarms(alarmRes.data ?? []);
    } catch (e) {
      console.error("Dashboard refresh failed:", e);
      setPageError("Couldn't load data. Is the backend running on :8080?");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const todayDayName = DAYS_OF_WEEK[new Date().getDay()];
  const todaysAlarms = alarms
    .filter((a) => a.active && a.repeatDays?.includes(todayDayName))
    .sort((a, b) => (a.alarmTime > b.alarmTime ? 1 : -1));

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Navbar />
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
          {getGreeting()}, {user?.username}!
        </Typography>

        {/* Summary cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">Medicines</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{medicines.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">Active Alarms</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {alarms.filter((a) => a.active).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">Today's Alarms ({todayDayName})</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{todaysAlarms.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {pageError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {pageError}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Medicines Column */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Your Medicines</Typography>
                  <MedicineForm onMedicineAdded={refreshAll} userId={userId} />
                  <MedicineList medicines={medicines} onChanged={refreshAll} />
                </CardContent>
              </Card>
              <AdherenceChart userId={userId} />
            </Grid>

            {/* Alarms Column */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Your Alarms</Typography>
                  <CreateAlarmForm
                    medicines={medicines}
                    onAlarmCreated={refreshAll}
                  />
                  <AlarmList
                    alarms={alarms}
                    medicines={medicines}
                    onChanged={refreshAll}
                  />
                </CardContent>
              </Card>
              <NextAlarmCard alarms={alarms} medNameById={medNameById} />
            </Grid>
          </Grid>
        )}
      </Box>

      <AlarmNotifier alarms={alarms} medicines={medicines} />
    </Box>
  );
}

export default Dashboard;
