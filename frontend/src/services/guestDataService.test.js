import { addLog, createAlarm, createMedicine, getLogs, getMedicines } from './guestDataService';

jest.mock('./nativePlatform', () => ({ isNativePlatform: () => false }));

async function setUpDose() {
  const { data: medicine } = await createMedicine({ name: 'Metformin', pillsRemaining: 30, pillsPerDose: 1 });
  const { data: alarm } = await createAlarm({ medicineId: medicine.id, alarmTime: '08:00', repeatDays: ['MONDAY'] });
  return alarm;
}

async function pillsRemaining() {
  const { data } = await getMedicines();
  return data[0].pillsRemaining;
}

beforeEach(() => {
  localStorage.clear();
});

describe('guest addLog', () => {
  it('stores a repeated Taken for the same dose once and uses one pill', async () => {
    const alarm = await setUpDose();
    await addLog(alarm.id, 'TAKEN', '2026-10-01T08:00:00');
    await addLog(alarm.id, 'TAKEN', '2026-10-01T08:00:00');

    expect((await getLogs()).data).toHaveLength(1);
    expect(await pillsRemaining()).toBe(29);
  });

  it('changes the answer for a dose and returns the pill', async () => {
    const alarm = await setUpDose();
    await addLog(alarm.id, 'TAKEN', '2026-10-01T08:00:00');
    await addLog(alarm.id, 'SKIPPED', '2026-10-01T08:00:00');

    const { data: logs } = await getLogs();
    expect(logs.map((log) => log.status)).toEqual(['SKIPPED']);
    expect(await pillsRemaining()).toBe(30);
  });

  it('keeps separate doses separate', async () => {
    const alarm = await setUpDose();
    await addLog(alarm.id, 'TAKEN', '2026-09-30T08:00:00');
    await addLog(alarm.id, 'TAKEN', '2026-10-01T08:00:00');

    expect((await getLogs()).data).toHaveLength(2);
    expect(await pillsRemaining()).toBe(28);
  });
});
