import {
  buildUpcomingAlarmInstances,
  findNextAlarm,
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
