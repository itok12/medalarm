import { buildGuestImportPayload, hasGuestData } from './guestImport';

const STORE = {
  medicines: [{ id: 1, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', pillsRemaining: 27 }],
  alarms: [
    { id: 1, medicineId: 1, medicineName: 'Metformin', alarmTime: '08:00', repeatDays: ['MONDAY'], active: true },
    { id: 2, medicineId: 9, alarmTime: '09:00', repeatDays: ['MONDAY'], active: true },
  ],
  logs: [
    { id: 1, alarmId: 1, status: 'TAKEN', takenAt: '2026-09-30T07:02:00.000Z', scheduledFor: '2026-09-30T08:00:00' },
    { id: 2, alarmId: 2, status: 'TAKEN', takenAt: '2026-09-30T08:02:00.000Z' },
  ],
};

describe('buildGuestImportPayload', () => {
  it('keeps the schedule and history and drops device-only fields', () => {
    const payload = buildGuestImportPayload(STORE);

    expect(payload.medicines).toEqual([expect.objectContaining({ id: 1, name: 'Metformin', pillsRemaining: 27, pillsPerDose: 1 })]);
    expect(payload.alarms).toEqual([{
      id: 1, medicineId: 1, alarmTime: '08:00', active: true, repeatDays: ['MONDAY'], source: 'MANUAL',
    }]);
    expect(payload.logs).toEqual([{
      alarmId: 1, status: 'TAKEN', takenAt: '2026-09-30T07:02:00.000Z', scheduledFor: '2026-09-30T08:00:00',
    }]);
  });

  it('leaves out alarms and logs whose medicine no longer exists', () => {
    const payload = buildGuestImportPayload(STORE);

    expect(payload.alarms.map((alarm) => alarm.id)).toEqual([1]);
    expect(payload.logs.map((log) => log.alarmId)).toEqual([1]);
  });

  it('handles an empty or missing store', () => {
    expect(buildGuestImportPayload(null)).toEqual({ medicines: [], alarms: [], logs: [] });
    expect(hasGuestData(null)).toBe(false);
    expect(hasGuestData(STORE)).toBe(true);
  });
});
