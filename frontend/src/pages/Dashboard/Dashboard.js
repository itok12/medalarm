import React, { useCallback, useEffect, useState } from "react";
import { Grid, Alert } from "@mui/material"; 
import Layout from "../components/Common/Layout";
import MedicineList from "../components/Medicine/MedicineList";
import MedicineForm from "../components/Medicine/MedicineForm";
import AlarmList from "../components/Alarm/AlarmList";
import CreateAlarmForm from "../components/Alarm/CreateAlarmForm";
import { medicineAPI, alarmAPI } from "../services/api";

function Dashboard() {
  const userId = 1;

  const [medicines, setMedicines] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const refreshAll = useCallback(async () => {
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
      setPageError("Couldn’t load data. Is the backend running on :8080?");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <Layout>
      <div className="dashboard-content">
        {pageError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {pageError}
          </Alert>
        )}

        {loading ? (
          <div>Loading…</div>
        ) : (
          <Grid container spacing={3} className="dashboard-grid">
            {/* Medicines Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <div className="dashboard-card">
                <h2>Your Medicines</h2>
                <MedicineForm onMedicineAdded={refreshAll} userId={userId} />
                <MedicineList medicines={medicines} />
              </div>
            </Grid>

            {/* Alarms Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <div className="dashboard-card">
                <h2>Your Alarms</h2>
                <CreateAlarmForm
                  medicines={medicines}
                  onAlarmCreated={refreshAll}
                />
                <AlarmList
                  alarms={alarms}
                  medicines={medicines}
                  onChanged={refreshAll}
                />
              </div>
            </Grid>
          </Grid>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;
