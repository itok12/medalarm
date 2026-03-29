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
