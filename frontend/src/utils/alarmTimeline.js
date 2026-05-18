export const DAYS_OF_WEEK = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export function formatTime12h(alarmTime) {
  if (!alarmTime) return '';
  const [hoursValue, minutesValue = '00'] = String(alarmTime).split(':');
  const hours = Number(hoursValue);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutesValue} ${ampm}`;
}

export function getCountdown(alarmTime, now = new Date()) {
  if (!alarmTime) return '';
  const [hoursValue, minutesValue = '00'] = String(alarmTime).split(':');
  const alarmDate = new Date(now);
  alarmDate.setHours(Number(hoursValue), Number(minutesValue), 0, 0);

  let diff = alarmDate.getTime() - now.getTime();
  if (diff < 0) {
    alarmDate.setDate(alarmDate.getDate() + 1);
    diff = alarmDate.getTime() - now.getTime();
  }

  const totalMinutes = Math.round(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}

export function createAlarmDate(baseDate, alarmTime) {
  const date = new Date(baseDate);
  const [hoursValue, minutesValue = '00'] = String(alarmTime).split(':');
  date.setHours(Number(hoursValue), Number(minutesValue), 0, 0);
  return date;
}

export function getTodaysAlarms(alarms = [], now = new Date()) {
  const todayName = DAYS_OF_WEEK[now.getDay()];
  return alarms
    .filter((alarm) => alarm.active && alarm.repeatDays?.includes(todayName))
    .sort((left, right) => String(left.alarmTime).localeCompare(String(right.alarmTime)));
}

export function findNextAlarm(alarms = [], now = new Date()) {
  for (let offset = 0; offset < 7; offset += 1) {
    const current = new Date(now);
    current.setDate(now.getDate() + offset);
    const dayName = DAYS_OF_WEEK[current.getDay()];

    const alarmsForDay = alarms
      .filter((alarm) => alarm.active && alarm.repeatDays?.includes(dayName))
      .sort((left, right) => String(left.alarmTime).localeCompare(String(right.alarmTime)));

    const upcoming = alarmsForDay.find((alarm) => createAlarmDate(current, alarm.alarmTime) > now);
    if (upcoming) {
      return {
        ...upcoming,
        scheduledFor: createAlarmDate(current, upcoming.alarmTime),
      };
    }
  }

  return null;
}

export function computeAdherenceStreak(logs = [], now = new Date()) {
  const takenDates = new Set(
    logs
      .filter((log) => log.status === 'TAKEN' && log.takenAt)
      .map((log) => {
        const d = new Date(log.takenAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
  );

  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const check = new Date(now);
  check.setHours(0, 0, 0, 0);
  if (!takenDates.has(todayKey)) {
    check.setDate(check.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;
    if (!takenDates.has(key)) break;
    streak += 1;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

export function takenInLast7Days(logs = [], now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 7);
  cutoff.setHours(0, 0, 0, 0);
  return logs.filter((log) => log.status === 'TAKEN' && log.takenAt && new Date(log.takenAt) >= cutoff).length;
}

export function buildUpcomingAlarmInstances(alarms = [], daysAhead = 7, now = new Date()) {
  const instances = [];

  for (let offset = 0; offset < daysAhead; offset += 1) {
    const current = new Date(now);
    current.setDate(now.getDate() + offset);
    const dayName = DAYS_OF_WEEK[current.getDay()];

    alarms.forEach((alarm) => {
      if (!alarm.active || !alarm.repeatDays?.includes(dayName)) {
        return;
      }

      const scheduledFor = createAlarmDate(current, alarm.alarmTime);
      if (scheduledFor <= now) {
        return;
      }

      instances.push({
        alarm,
        scheduledFor,
      });
    });
  }

  return instances.sort((left, right) => left.scheduledFor.getTime() - right.scheduledFor.getTime());
}
