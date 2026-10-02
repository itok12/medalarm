import { DAYS_OF_WEEK, createAlarmDate, doseDateTimeKey } from './alarmTimeline';

// Pure scheduling core: decides which OS notifications should exist right now.
// It has no side effects, so every rule here is unit-testable with a fixed clock.

export const NOTIFICATION_KIND = {
  MAIN: 0,
  NUDGE_1: 1,
  NUDGE_2: 2,
  SNOOZE: 3,
};

export const NUDGE_OFFSETS_MINUTES = [15, 30];

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;
const LOG_MATCH_WINDOW_MS = 12 * 60 * MS_PER_MINUTE;

// Notification ids must be positive Java ints. Pack (alarm, local day, kind) into
// one: alarm id mod 100,000 x day number mod 1,000 x 4 kinds. The max value is
// ~4.0e8, well under 2^31 - 1. The same dose always gets the same id, so
// rescheduling replaces a notification instead of duplicating it.
const ALARM_ID_SLOTS = 100000;
const DAY_SLOTS = 1000;
const KIND_SLOTS = 4;

export function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function localDayNumber(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);
}

export function isValidAlarmId(alarmId) {
  const numericId = Number(alarmId);
  return alarmId !== null && alarmId !== '' && Number.isSafeInteger(numericId) && numericId > 0;
}

export function notificationId(alarmId, date, kind) {
  if (!isValidAlarmId(alarmId)) {
    throw new Error(`Cannot build a notification id for alarm "${alarmId}"`);
  }
  const alarmSlot = Number(alarmId) % ALARM_ID_SLOTS;
  const daySlot = localDayNumber(date) % DAY_SLOTS;
  return (alarmSlot * DAY_SLOTS + daySlot) * KIND_SLOTS + kind + 1;
}

export function doseKey(alarmId, doseDate) {
  return `${alarmId}|${localDateKey(doseDate)}`;
}

// Logs carry the dose they answer in scheduledFor. Older logs only record when
// they were written, so match those to the nearest scheduled time of their alarm
// within +/-12 h (handles a 23:00 dose logged at 00:30 the next day).
export function resolveAnsweredDoses(logs = [], alarmsById = new Map()) {
  const answered = new Set();

  logs.forEach((log) => {
    if (log.status !== 'TAKEN' && log.status !== 'SKIPPED') return;

    const alarm = alarmsById.get(String(log.alarmId));
    if (alarm && log.scheduledFor) {
      answered.add(`${alarm.id}|${String(log.scheduledFor).slice(0, 10)}`);
      return;
    }

    const loggedAt = log.takenAt ? new Date(log.takenAt) : null;
    if (!alarm || !loggedAt || Number.isNaN(loggedAt.getTime())) return;

    let nearest = null;
    [-1, 0, 1].forEach((dayOffset) => {
      const day = new Date(loggedAt);
      day.setDate(day.getDate() + dayOffset);
      const doseAt = createAlarmDate(day, alarm.alarmTime);
      const distance = Math.abs(doseAt.getTime() - loggedAt.getTime());
      if (!nearest || distance < nearest.distance) {
        nearest = { doseAt, distance };
      }
    });

    if (nearest && nearest.distance <= LOG_MATCH_WINDOW_MS) {
      answered.add(doseKey(alarm.id, nearest.doseAt));
    }
  });

  return answered;
}

function buildNotification({ alarm, doseAt, kind, at, title, body, exact }) {
  return {
    id: notificationId(alarm.id, doseAt, kind),
    at,
    title,
    body,
    extra: {
      alarmId: alarm.id,
      medicineId: alarm.medicineId,
      doseDate: localDateKey(doseAt),
      scheduledFor: doseDateTimeKey(doseAt),
      kind,
      // Lets the reconciler detect a pending notification that is out of date.
      sig: `${at.getTime()}|${title}|${body}|${exact ? 'exact' : 'inexact'}`,
    },
  };
}

export function planNotifications({
  alarms = [],
  medicines = [],
  logs = [],
  now = new Date(),
  daysAhead = 7,
  nudgeOffsetsMinutes = NUDGE_OFFSETS_MINUTES,
  limit = Infinity,
  exact = false,
} = {}) {
  if (nudgeOffsetsMinutes.length > NOTIFICATION_KIND.SNOOZE - 1) {
    throw new Error('At most two nudge offsets fit in the notification id scheme');
  }

  const skippedAlarmIds = [];
  const activeAlarms = alarms.filter((alarm) => {
    if (!alarm.active || !alarm.alarmTime) return false;
    if (!isValidAlarmId(alarm.id)) {
      skippedAlarmIds.push(alarm.id);
      return false;
    }
    return true;
  });

  const alarmsById = new Map(activeAlarms.map((alarm) => [String(alarm.id), alarm]));
  const medicinesById = new Map(medicines.map((medicine) => [String(medicine.id), medicine]));
  const answeredDoses = resolveAnsweredDoses(logs, alarmsById);
  const lastNudgeMs = Math.max(0, ...nudgeOffsetsMinutes) * MS_PER_MINUTE;
  const nowMs = now.getTime();
  const notifications = [];

  // Start at yesterday so nudges for a late-evening dose survive past midnight.
  for (let dayOffset = -1; dayOffset < daysAhead; dayOffset += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() + dayOffset);
    const dayName = DAYS_OF_WEEK[day.getDay()];

    activeAlarms.forEach((alarm) => {
      if (!alarm.repeatDays?.includes(dayName)) return;

      const doseAt = createAlarmDate(day, alarm.alarmTime);
      if (doseAt.getTime() + lastNudgeMs <= nowMs) return;
      if (answeredDoses.has(doseKey(alarm.id, doseAt))) return;

      const medicine = medicinesById.get(String(alarm.medicineId));
      const medicineName = medicine?.name || 'your medicine';

      if (doseAt.getTime() > nowMs) {
        notifications.push(buildNotification({
          alarm,
          doseAt,
          exact,
          kind: NOTIFICATION_KIND.MAIN,
          at: doseAt,
          title: `Time to take ${medicineName}`,
          body: medicine?.dosage ? `Dose: ${medicine.dosage}` : 'Open MedAlarm to mark this dose.',
        }));
      }

      nudgeOffsetsMinutes.forEach((minutes, index) => {
        const at = new Date(doseAt.getTime() + minutes * MS_PER_MINUTE);
        if (at.getTime() <= nowMs) return;
        notifications.push(buildNotification({
          alarm,
          doseAt,
          exact,
          kind: NOTIFICATION_KIND.NUDGE_1 + index,
          at,
          title: `Reminder: ${medicineName}`,
          body: 'Have you taken your dose? Tap to log it.',
        }));
      });
    });
  }

  notifications.sort((left, right) => left.at.getTime() - right.at.getTime());

  return {
    notifications: notifications.slice(0, limit),
    answeredDoses,
    skippedAlarmIds,
  };
}

// Diff the desired plan against what the OS already has pending. Only the delta
// is cancelled or scheduled, so repeated syncs are idempotent.
export function reconcileNotifications(desired = [], pending = [], answeredDoses = new Set()) {
  const desiredById = new Map(desired.map((notification) => [notification.id, notification]));
  const keptIds = new Set();
  const toCancel = [];

  pending.forEach((notification) => {
    const extra = notification.extra || {};

    if (extra.kind === NOTIFICATION_KIND.SNOOZE) {
      // Snoozes come from a user action, so keep them unless the dose was answered.
      if (answeredDoses.has(`${extra.alarmId}|${extra.doseDate}`)) {
        toCancel.push(notification.id);
      }
      return;
    }

    const wanted = desiredById.get(notification.id);
    if (wanted && wanted.extra.sig === extra.sig) {
      keptIds.add(notification.id);
      return;
    }

    toCancel.push(notification.id);
  });

  const toSchedule = desired.filter((notification) => !keptIds.has(notification.id));
  return { toCancel, toSchedule };
}
