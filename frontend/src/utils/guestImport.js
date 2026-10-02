// Shapes the on-device guest store into the /import/guest request. Pure, so the
// mapping rules are unit-tested; the server re-validates everything.
export function buildGuestImportPayload(store) {
  const medicines = (store?.medicines ?? []).map((medicine) => ({
    id: medicine.id,
    name: medicine.name,
    dosage: medicine.dosage ?? '',
    frequency: medicine.frequency,
    instructions: medicine.instructions || null,
    startDate: medicine.startDate || null,
    endDate: medicine.endDate || null,
    pillsRemaining: medicine.pillsRemaining ?? null,
    pillsPerDose: medicine.pillsPerDose ?? 1,
  }));

  const medicineIds = new Set(medicines.map((medicine) => medicine.id));
  const alarms = (store?.alarms ?? [])
    .filter((alarm) => medicineIds.has(alarm.medicineId) && alarm.alarmTime)
    .map((alarm) => ({
      id: alarm.id,
      medicineId: alarm.medicineId,
      alarmTime: String(alarm.alarmTime).slice(0, 5),
      active: alarm.active !== false,
      repeatDays: alarm.repeatDays ?? [],
      source: alarm.source === 'AUTO' ? 'AUTO' : 'MANUAL',
    }));

  const alarmIds = new Set(alarms.map((alarm) => alarm.id));
  const logs = (store?.logs ?? [])
    .filter((log) => alarmIds.has(log.alarmId) && log.status)
    .map((log) => ({
      alarmId: log.alarmId,
      status: log.status,
      takenAt: log.takenAt || null,
      scheduledFor: log.scheduledFor || null,
    }));

  return { medicines, alarms, logs };
}

export function hasGuestData(store) {
  return (store?.medicines ?? []).length > 0;
}
