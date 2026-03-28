export const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildAdherenceChartData(logs = [], referenceDate = new Date()) {
  const days = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(referenceDate);
    date.setHours(12, 0, 0, 0);
    date.setDate(referenceDate.getDate() - i);
    days.push({ date: getDateKey(date), label: DAY_ABBR[date.getDay()], TAKEN: 0, SKIPPED: 0 });
  }

  logs.forEach((log) => {
    const dayKey = log.takenAt?.slice(0, 10);
    const entry = days.find((day) => day.date === dayKey);
    if (entry && (log.status === 'TAKEN' || log.status === 'SKIPPED')) {
      entry[log.status] += 1;
    }
  });

  return days;
}
