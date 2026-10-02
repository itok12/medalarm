import {
  buildUpcomingAlarmInstances,
  findNextAlarm,
  findTodaysAnswer,
  formatTime12h,
  getTodaysAlarms,
} from './alarmTimeline';

describe('alarmTimeline', () => {
  const alarms = [
    { id: 1, active: true, alarmTime: '08:00:00', repeatDays: ['SATURDAY'], medicineId: 10 },
    { id: 2, active: true, alarmTime: '18:30:00', repeatDays: ['SATURDAY', 'SUNDAY'], medicineId: 11 },
    { id: 3, active: false, alarmTime: '09:00:00', repeatDays: ['SATURDAY'], medicineId: 12 },
  ];

  it('formats 24-hour times into 12-hour display', () => {
    expect(formatTime12h('00:05:00')).toBe('12:05 AM');
    expect(formatTime12h('13:45:00')).toBe('1:45 PM');
  });

  it('returns only active alarms for today', () => {
    const today = new Date('2026-03-28T07:00:00');
    expect(getTodaysAlarms(alarms, today).map((alarm) => alarm.id)).toEqual([1, 2]);
  });

  it('finds the next alarm across days', () => {
    const now = new Date('2026-03-28T19:00:00');
    const nextAlarm = findNextAlarm(alarms, now);
    expect(nextAlarm.id).toBe(2);
    expect(nextAlarm.scheduledFor.toISOString()).toContain('2026-03-29');
  });

  it('builds upcoming alarm instances for native scheduling', () => {
    const now = new Date('2026-03-28T07:00:00');
    const instances = buildUpcomingAlarmInstances(alarms, 2, now);
    expect(instances).toHaveLength(3);
    expect(instances[0].alarm.id).toBe(1);
    expect(instances[1].alarm.id).toBe(2);
  });
});

describe('findTodaysAnswer', () => {
  const alarm = { id: 3, alarmTime: '08:00' };
  const now = new Date('2026-10-02T09:00');

  it('finds the Taken or Skipped log for today\'s dose', () => {
    const logs = [
      { id: 1, alarmId: 3, status: 'TAKEN', scheduledFor: '2026-10-01T08:00:00' },
      { id: 2, alarmId: 3, status: 'SKIPPED', scheduledFor: '2026-10-02T08:00:00' },
    ];
    expect(findTodaysAnswer(logs, alarm, now).id).toBe(2);
  });

  it('ignores snoozes, other alarms, and logs without a dose', () => {
    const logs = [
      { id: 1, alarmId: 3, status: 'SNOOZED', scheduledFor: '2026-10-02T08:00:00' },
      { id: 2, alarmId: 4, status: 'TAKEN', scheduledFor: '2026-10-02T08:00:00' },
      { id: 3, alarmId: 3, status: 'TAKEN', takenAt: '2026-10-02T07:59:00Z' },
    ];
    expect(findTodaysAnswer(logs, alarm, now)).toBeNull();
  });
});
