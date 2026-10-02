import { addLog, createAlarm, createMedicine, exportCSV, getLogs, getMedicines } from './guestDataService';

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

describe('guest exportCSV', () => {
  it('uses the local date with the local time and includes the scheduled dose', async () => {
    const alarm = await setUpDose();
    // 00:30 on 2 Oct in London is 23:30 on 1 Oct in UTC.
    await addLog(alarm.id, 'TAKEN', '2026-10-02T08:00:00');
    const store = JSON.parse(localStorage.getItem('medalarm-guest-store-v1'));
    store.logs[0].takenAt = new Date('2026-10-02T00:30:00').toISOString();
    localStorage.setItem('medalarm-guest-store-v1', JSON.stringify(store));

    const { data } = await exportCSV();
    // jsdom's Blob (Jest 27) has no .text(); browsers and the WebView do.
    const text = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsText(data);
    });
    const lines = text.split('\n');

    expect(lines[0]).toBe('Date,Time,Scheduled,Medicine,Dosage,Status');
    expect(lines[1]).toBe('2026-10-02,00:30:00,2026-10-02 08:00,Metformin,,TAKEN');
  });
});
