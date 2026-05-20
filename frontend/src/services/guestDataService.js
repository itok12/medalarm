import { getJson, setJson } from './deviceStorage';

const STORE_KEY = 'medalarm-guest-store-v1';

const FREQUENCY_TIMES = {
  'Once daily': ['08:00'],
  'Twice daily': ['08:00', '20:00'],
  'Three times daily': ['08:00', '14:00', '20:00'],
  'Four times daily': ['08:00', '12:00', '16:00', '20:00'],
  'As needed': [],
};

const ALL_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

function genId(items) {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1;
}

async function load() {
  return getJson(STORE_KEY, { medicines: [], alarms: [], logs: [] });
}

async function save(store) {
  await setJson(STORE_KEY, store);
}

function ok(data) {
  return Promise.resolve({ data });
}

// ── Medicines ──────────────────────────────────────────────────────────────

export async function getMedicines() {
  const store = await load();
  return ok(store.medicines);
}

export async function createMedicine(medicine) {
  const store = await load();
  const created = { ...medicine, id: genId(store.medicines) };
  store.medicines.push(created);
  await save(store);
  return ok(created);
}

export async function updateMedicine(id, data) {
  const store = await load();
  const idx = store.medicines.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error('Medicine not found');
  store.medicines[idx] = { ...store.medicines[idx], ...data };
  await save(store);
  return ok(store.medicines[idx]);
}

export async function deleteMedicine(id) {
  const store = await load();
  store.medicines = store.medicines.filter((m) => m.id !== id);
  store.alarms = store.alarms.filter((a) => a.medicineId !== id);
  await save(store);
  return ok({});
}

// ── Alarms ─────────────────────────────────────────────────────────────────

export async function getAlarms() {
  const store = await load();
  return ok(store.alarms);
}

export async function generateAlarms(medicineId) {
  const store = await load();
  const medicine = store.medicines.find((m) => m.id === medicineId);
  if (!medicine) throw new Error('Medicine not found');

  const times = FREQUENCY_TIMES[medicine.frequency] ?? [];
  let nextId = genId(store.alarms);

  const created = times.map((time) => ({
    id: nextId++,
    medicineId,
    medicineName: medicine.name,
    alarmTime: time,
    repeatDays: ALL_DAYS,
    active: true,
  }));

  store.alarms.push(...created);
  await save(store);
  return ok(created);
}

export async function createAlarm(alarm) {
  const store = await load();
  const created = { ...alarm, id: genId(store.alarms), active: true };
  store.alarms.push(created);
  await save(store);
  return ok(created);
}

export async function toggleAlarm(alarmId, active) {
  const store = await load();
  const alarm = store.alarms.find((a) => a.id === alarmId);
  if (alarm) alarm.active = active;
  await save(store);
  return ok({});
}

export async function deleteAlarm(id) {
  const store = await load();
  store.alarms = store.alarms.filter((a) => a.id !== id);
  await save(store);
  return ok({});
}

// ── Logs ───────────────────────────────────────────────────────────────────

export async function getLogs() {
  const store = await load();
  return ok(store.logs);
}

export async function addLog(alarmId, status) {
  const store = await load();
  const alarm = store.alarms.find((a) => a.id === alarmId);
  const medicine = alarm
    ? store.medicines.find((m) => m.id === alarm.medicineId)
    : null;

  const entry = {
    id: genId(store.logs),
    alarmId,
    medicineId: alarm?.medicineId ?? null,
    medicineName: medicine?.name ?? '',
    takenAt: new Date().toISOString(),
    status,
  };

  store.logs.push(entry);
  await save(store);
  return ok(entry);
}

export async function exportCSV() {
  const store = await load();
  const rows = ['Date,Time,Medicine,Dosage,Status'];

  store.logs.forEach((log) => {
    const d = log.takenAt ? new Date(log.takenAt) : null;
    const date = d ? d.toISOString().slice(0, 10) : '';
    const time = d ? d.toTimeString().slice(0, 8) : '';
    const medicine = store.medicines.find((m) => m.id === log.medicineId);
    rows.push(`${date},${time},${medicine?.name ?? ''},${medicine?.dosage ?? ''},${log.status}`);
  });

  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  return Promise.resolve({ data: blob });
}

export function clearGuestStore() {
  localStorage.removeItem(STORE_KEY);
}
