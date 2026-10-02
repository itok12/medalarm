import {
  NOTIFICATION_KIND,
  notificationId,
  planNotifications,
  reconcileNotifications,
} from './notificationPlan';

// Tests run in Europe/London (src/jestGlobalSetup.js).
// UK clocks go back on 2026-10-25 and forward on 2027-03-28.

const EVERY_DAY = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const MEDICINES = [{ id: 1, name: 'Metformin', dosage: '500mg' }];

function alarm(overrides = {}) {
  return { id: 1, medicineId: 1, alarmTime: '08:00', repeatDays: EVERY_DAY, active: true, ...overrides };
}

function at(isoLocal) {
  // "2026-10-01T08:00" without a zone is parsed as local (Europe/London) time.
  return new Date(isoLocal);
}

function plan(options) {
  return planNotifications({ medicines: MEDICINES, ...options });
}

function kindsFor(notifications, doseDate) {
  return notifications.filter((n) => n.extra.doseDate === doseDate).map((n) => n.extra.kind);
}

describe('planNotifications', () => {
  it('runs in Europe/London so DST cases are meaningful', () => {
    expect(at('2026-07-01T12:00').getTimezoneOffset()).toBe(-60);
    expect(at('2026-12-01T12:00').getTimezoneOffset()).toBe(0);
  });

  it('plans a reminder and two nudges for each dose over the next 7 days', () => {
    const { notifications } = plan({ alarms: [alarm()], now: at('2026-10-01T07:00') });

    expect(notifications).toHaveLength(21);
    expect(kindsFor(notifications, '2026-10-01')).toEqual([
      NOTIFICATION_KIND.MAIN,
      NOTIFICATION_KIND.NUDGE_1,
      NOTIFICATION_KIND.NUDGE_2,
    ]);
    expect(notifications[0].title).toBe('Time to take Metformin');
    expect(notifications[0].body).toBe('Dose: 500mg');
  });

  it('keeps pending nudges when the app is opened just after the dose time', () => {
    const { notifications } = plan({ alarms: [alarm()], now: at('2026-10-01T08:05') });

    expect(kindsFor(notifications, '2026-10-01')).toEqual([
      NOTIFICATION_KIND.NUDGE_1,
      NOTIFICATION_KIND.NUDGE_2,
    ]);
  });

  it('drops only the answered dose when a dose is marked taken', () => {
    const logs = [{ alarmId: 1, status: 'TAKEN', takenAt: at('2026-10-01T08:03').toISOString() }];
    const { notifications } = plan({ alarms: [alarm()], logs, now: at('2026-10-01T08:04') });

    expect(kindsFor(notifications, '2026-10-01')).toEqual([]);
    expect(kindsFor(notifications, '2026-10-02')).toHaveLength(3);
    expect(notifications).toHaveLength(18);
  });

  it('uses the dose a log names, even when it is logged hours early', () => {
    // Seen on a device: Taken at 02:37 for tonight's 20:00 dose was matched to
    // last night's (nearer) dose before logs carried scheduledFor.
    const evening = alarm({ alarmTime: '20:00' });
    const logs = [{
      alarmId: 1,
      status: 'TAKEN',
      takenAt: at('2026-10-01T02:37').toISOString(),
      scheduledFor: '2026-10-01T20:00:00',
    }];
    const { notifications } = plan({ alarms: [evening], logs, now: at('2026-10-01T02:38') });

    expect(kindsFor(notifications, '2026-10-01')).toEqual([]);
    expect(kindsFor(notifications, '2026-10-02')).toHaveLength(3);
  });

  it('puts the dose identity on every notification', () => {
    const { notifications } = plan({ alarms: [alarm()], now: at('2026-10-01T07:00') });

    expect(notifications[0].extra.scheduledFor).toBe('2026-10-01T08:00:00');
    expect(notifications[1].extra.scheduledFor).toBe('2026-10-01T08:00:00');
  });

  it('treats a skipped dose as answered but a snoozed one as still due', () => {
    const now = at('2026-10-01T08:04');
    const skipped = plan({
      alarms: [alarm()],
      logs: [{ alarmId: 1, status: 'SKIPPED', takenAt: now.toISOString() }],
      now,
    });
    const snoozed = plan({
      alarms: [alarm()],
      logs: [{ alarmId: 1, status: 'SNOOZED', takenAt: now.toISOString() }],
      now,
    });

    expect(kindsFor(skipped.notifications, '2026-10-01')).toEqual([]);
    expect(kindsFor(snoozed.notifications, '2026-10-01')).toHaveLength(2);
  });

  it('matches a log written after midnight to the previous night\'s dose', () => {
    const lateAlarm = alarm({ alarmTime: '23:00' });
    const logs = [{ alarmId: 1, status: 'TAKEN', takenAt: at('2026-10-02T00:30').toISOString() }];
    const { notifications } = plan({ alarms: [lateAlarm], logs, now: at('2026-10-02T00:31') });

    expect(kindsFor(notifications, '2026-10-01')).toEqual([]);
    expect(kindsFor(notifications, '2026-10-02')).toHaveLength(3);
  });

  it('keeps nudges for a late-evening dose that fall after midnight', () => {
    const lateAlarm = alarm({ alarmTime: '23:50' });
    const { notifications } = plan({ alarms: [lateAlarm], now: at('2026-10-02T00:01') });

    const overnight = notifications.filter((n) => n.extra.doseDate === '2026-10-01');
    expect(overnight.map((n) => n.at.toISOString())).toEqual([
      at('2026-10-02T00:05').toISOString(),
      at('2026-10-02T00:20').toISOString(),
    ]);
  });

  it('skips inactive alarms and days the alarm does not repeat on', () => {
    const { notifications } = plan({
      alarms: [
        alarm({ id: 1, repeatDays: ['MONDAY'] }),
        alarm({ id: 2, active: false }),
      ],
      now: at('2026-10-01T07:00'), // a Thursday
    });

    expect(new Set(notifications.map((n) => n.extra.doseDate))).toEqual(new Set(['2026-10-05']));
  });

  it('skips alarms with non-numeric ids instead of failing the whole batch', () => {
    const { notifications, skippedAlarmIds } = plan({
      alarms: [alarm({ id: '1717171717-abc12' }), alarm({ id: 2 })],
      now: at('2026-10-01T07:00'),
    });

    expect(skippedAlarmIds).toEqual(['1717171717-abc12']);
    expect(notifications.every((n) => n.extra.alarmId === 2)).toBe(true);
    expect(notifications).toHaveLength(21);
  });

  it('caps the plan to the soonest notifications (iOS keeps only 64 pending)', () => {
    const alarms = ['08:00', '12:00', '16:00', '20:00'].map((time, index) => alarm({ id: index + 1, alarmTime: time }));
    const { notifications } = plan({ alarms, now: at('2026-10-01T07:00'), limit: 60 });

    expect(notifications).toHaveLength(60);
    const times = notifications.map((n) => n.at.getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(notifications[0].at).toEqual(at('2026-10-01T08:00'));
  });

  it('keeps wall-clock time across the autumn clock change', () => {
    const { notifications } = plan({ alarms: [alarm()], now: at('2026-10-24T12:00') });
    const mains = notifications.filter((n) => n.extra.kind === NOTIFICATION_KIND.MAIN);

    expect(mains.every((n) => n.at.getHours() === 8 && n.at.getMinutes() === 0)).toBe(true);
    // 08:00 BST is 07:00 UTC; 08:00 GMT after the change is 08:00 UTC.
    expect(mains.find((n) => n.extra.doseDate === '2026-10-24')).toBeUndefined();
    expect(mains.find((n) => n.extra.doseDate === '2026-10-25').at.toISOString()).toBe('2026-10-25T08:00:00.000Z');
  });

  it('fires once for a time that happens twice when clocks go back', () => {
    const { notifications } = plan({ alarms: [alarm({ alarmTime: '01:30' })], now: at('2026-10-24T12:00') });
    const mainsOnChangeDay = notifications.filter(
      (n) => n.extra.doseDate === '2026-10-25' && n.extra.kind === NOTIFICATION_KIND.MAIN,
    );

    expect(mainsOnChangeDay).toHaveLength(1);
  });

  it('still fires for a time skipped when clocks go forward', () => {
    const { notifications } = plan({ alarms: [alarm({ alarmTime: '01:30' })], now: at('2027-03-27T12:00') });
    const main = notifications.find(
      (n) => n.extra.doseDate === '2027-03-28' && n.extra.kind === NOTIFICATION_KIND.MAIN,
    );

    // 01:30 does not exist on 2027-03-28 in London; the reminder moves to 02:30 BST.
    expect(main).toBeDefined();
    expect(main.at.toISOString()).toBe('2027-03-28T01:30:00.000Z');
  });
});

describe('notificationId', () => {
  it('is deterministic for the same dose and kind', () => {
    const date = at('2026-10-01T08:00');
    expect(notificationId(7, date, NOTIFICATION_KIND.MAIN)).toBe(notificationId(7, at('2026-10-01T20:00'), NOTIFICATION_KIND.MAIN));
  });

  it('produces unique positive Java ints for large server ids across a week', () => {
    const ids = new Set();
    const alarmIds = [1, 2, 99, 100, 101, 200, 21475, 99999, 9000123, 2147483647];
    for (let day = 0; day < 7; day += 1) {
      const date = at('2026-10-01T08:00');
      date.setDate(date.getDate() + day);
      alarmIds.forEach((alarmId) => {
        Object.values(NOTIFICATION_KIND).forEach((kind) => {
          const id = notificationId(alarmId, date, kind);
          expect(Number.isInteger(id)).toBe(true);
          expect(id).toBeGreaterThan(0);
          expect(id).toBeLessThanOrEqual(2147483647);
          ids.add(id);
        });
      });
    }
    expect(ids.size).toBe(7 * alarmIds.length * Object.keys(NOTIFICATION_KIND).length);
  });

  it('rejects ids that cannot be packed', () => {
    expect(() => notificationId('abc', at('2026-10-01T08:00'), 0)).toThrow();
    expect(() => notificationId(null, at('2026-10-01T08:00'), 0)).toThrow();
  });
});

describe('reconcileNotifications', () => {
  const now = at('2026-10-01T07:00');

  function pendingFrom(notifications) {
    return notifications.map(({ id, title, extra }) => ({ id, title, extra: { ...extra } }));
  }

  it('does nothing when the OS already matches the plan', () => {
    const { notifications } = plan({ alarms: [alarm()], now });
    const result = reconcileNotifications(notifications, pendingFrom(notifications));

    expect(result).toEqual({ toCancel: [], toSchedule: [] });
  });

  it('schedules everything on first run and cancels leftovers from older versions', () => {
    const { notifications } = plan({ alarms: [alarm()], now });
    const legacy = [{ id: 101, extra: { alarmId: 1, nudge: false } }, { id: 10101, extra: { alarmId: 1, nudge: true } }];
    const result = reconcileNotifications(notifications, legacy);

    expect(result.toCancel).toEqual([101, 10101]);
    expect(result.toSchedule).toHaveLength(21);
  });

  it('reschedules only what changed', () => {
    const before = plan({ alarms: [alarm()], now }).notifications;
    const after = plan({ alarms: [alarm()], medicines: [{ id: 1, name: 'Metformin', dosage: '850mg' }], now }).notifications;
    const result = reconcileNotifications(after, pendingFrom(before));

    const changedMainIds = after.filter((n) => n.extra.kind === NOTIFICATION_KIND.MAIN).map((n) => n.id);
    expect(result.toCancel.sort()).toEqual(changedMainIds.sort());
    expect(result.toSchedule.map((n) => n.id).sort()).toEqual(changedMainIds.sort());
  });

  it('reschedules everything when exact-alarm permission changes', () => {
    const inexact = plan({ alarms: [alarm()], now, exact: false }).notifications;
    const exact = plan({ alarms: [alarm()], now, exact: true }).notifications;
    const result = reconcileNotifications(exact, pendingFrom(inexact));

    expect(result.toSchedule).toHaveLength(21);
  });

  it('never cancels a test reminder', () => {
    const test = { id: 2000000000, extra: { test: true } };
    expect(reconcileNotifications([], [test]).toCancel).toEqual([]);
  });

  it('keeps a snooze until its dose is answered', () => {
    const snooze = { id: 5, extra: { alarmId: 1, doseDate: '2026-10-01', kind: NOTIFICATION_KIND.SNOOZE } };

    expect(reconcileNotifications([], [snooze]).toCancel).toEqual([]);
    expect(reconcileNotifications([], [snooze], new Set(['1|2026-10-01'])).toCancel).toEqual([5]);
  });
});
