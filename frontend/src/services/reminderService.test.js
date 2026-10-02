import { scheduleSnoozedReminder, syncNativeAlarmNotifications } from './reminderService';

// In-memory stand-in for the OS notification queue. Plain functions, because
// CRA's Jest config resets jest.fn implementations before every test.
const mockPending = new Map();
const mockCalls = { schedule: 0 };

jest.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    checkPermissions: async () => ({ display: 'granted' }),
    createChannel: async () => {},
    registerActionTypes: async () => {},
    checkExactNotificationSetting: async () => ({ exact_alarm: 'granted' }),
    getPending: async () => ({ notifications: [...mockPending.values()] }),
    cancel: async ({ notifications }) => {
      notifications.forEach(({ id }) => mockPending.delete(id));
    },
    schedule: async ({ notifications }) => {
      mockCalls.schedule += 1;
      notifications.forEach((notification) => mockPending.set(notification.id, notification));
    },
  },
}));

jest.mock('./nativePlatform', () => ({
  getPlatform: () => 'android',
  isNativeMobilePlatform: () => true,
}));

const EVERY_DAY = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const MEDICINES = [{ id: 1, name: 'Metformin', dosage: '500mg' }];
const ALARMS = [
  { id: 1, medicineId: 1, alarmTime: '08:00', repeatDays: EVERY_DAY, active: true },
  { id: 2, medicineId: 1, alarmTime: '20:00', repeatDays: EVERY_DAY, active: true },
];

function pendingForDose(alarmId, doseDate) {
  return [...mockPending.values()].filter(
    (n) => n.extra.alarmId === alarmId && n.extra.doseDate === doseDate,
  );
}

beforeEach(() => {
  mockPending.clear();
  mockCalls.schedule = 0;
  // Jest 27 (react-scripts 5) API for a fixed clock.
  jest.useFakeTimers('modern');
  jest.setSystemTime(new Date('2026-10-01T19:48:00'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('syncNativeAlarmNotifications', () => {
  it('schedules the week, then leaves the OS alone when nothing changed', async () => {
    await syncNativeAlarmNotifications(ALARMS, MEDICINES, []);
    // Today's 08:00 dose and its nudges are past; 20:00 onward is scheduled.
    expect(mockPending.size).toBe(39);

    const second = await syncNativeAlarmNotifications(ALARMS, MEDICINES, []);
    expect(second).toMatchObject({ scheduled: 0, cancelled: 0 });
  });

  it('removes only the answered dose when it is marked taken', async () => {
    await syncNativeAlarmNotifications(ALARMS, MEDICINES, []);

    const logs = [{ alarmId: 2, status: 'TAKEN', takenAt: new Date().toISOString() }];
    const result = await syncNativeAlarmNotifications(ALARMS, MEDICINES, logs);

    // Regression: the old cancelNudgesForAlarm dropped all 21 of alarm 2's
    // notifications for the week (39 -> 18 on a device).
    expect(result).toMatchObject({ cancelled: 3, scheduled: 0 });
    expect(mockPending.size).toBe(36);
    expect(pendingForDose(2, '2026-10-01')).toHaveLength(0);
    expect(pendingForDose(2, '2026-10-02')).toHaveLength(3);
  });

  it('keeps a snooze across syncs and cancels it once the dose is answered', async () => {
    await syncNativeAlarmNotifications(ALARMS, MEDICINES, []);
    await scheduleSnoozedReminder({ alarmId: 2, medicineId: 1, medicineName: 'Metformin', minutes: 10 });
    expect(mockPending.size).toBe(40);

    await syncNativeAlarmNotifications(ALARMS, MEDICINES, []);
    expect(mockPending.size).toBe(40);

    const logs = [{ alarmId: 2, status: 'TAKEN', takenAt: new Date().toISOString() }];
    await syncNativeAlarmNotifications(ALARMS, MEDICINES, logs);
    expect(pendingForDose(2, '2026-10-01')).toHaveLength(0);
  });

  it('runs overlapping syncs one after another', async () => {
    await Promise.all([
      syncNativeAlarmNotifications(ALARMS, MEDICINES, []),
      syncNativeAlarmNotifications(ALARMS, MEDICINES, []),
      syncNativeAlarmNotifications(ALARMS, MEDICINES, []),
    ]);

    expect(mockCalls.schedule).toBe(1);
    expect(mockPending.size).toBe(39);
  });
});
