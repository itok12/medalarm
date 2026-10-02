import { LocalNotifications } from '@capacitor/local-notifications';
import { getPlatform, isNativeMobilePlatform } from './nativePlatform';
import {
  NOTIFICATION_KIND,
  localDateKey,
  notificationId,
  planNotifications,
  reconcileNotifications,
} from '../utils/notificationPlan';

const CHANNEL_ID = 'medalarm-reminders';
export const DOSE_ACTION_TYPE = 'medalarm-dose';
export const DOSE_ACTIONS = { TAKEN: 'taken', SNOOZE: 'snooze' };

// iOS silently drops everything past 64 pending notifications; leave room for a snooze.
// Android caps alarms per app at 500.
const PENDING_LIMIT = { ios: 60, android: 400 };

let actionTypesRegistered = false;
let syncQueue = Promise.resolve();

async function ensureAndroidChannel() {
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Medication reminders',
      description: 'Reminders for upcoming MedAlarm doses',
      importance: 5,
      visibility: 1,
    });
  } catch {
    // Channel creation is only relevant on Android and can be ignored elsewhere.
  }
}

async function ensureActionTypes() {
  if (actionTypesRegistered) return;
  await LocalNotifications.registerActionTypes({
    types: [
      {
        id: DOSE_ACTION_TYPE,
        actions: [
          { id: DOSE_ACTIONS.TAKEN, title: 'Taken' },
          { id: DOSE_ACTIONS.SNOOZE, title: 'Snooze' },
        ],
      },
    ],
  });
  actionTypesRegistered = true;
}

function toPluginNotification({ id, title, body, at, extra }) {
  return {
    id,
    title,
    body,
    schedule: { at, allowWhileIdle: true },
    channelId: CHANNEL_ID,
    actionTypeId: DOSE_ACTION_TYPE,
    extra,
  };
}

export async function getReminderPermissionStatus() {
  if (isNativeMobilePlatform()) {
    const permissions = await LocalNotifications.checkPermissions();
    return permissions.display || 'prompt';
  }

  if (!('Notification' in window)) {
    return 'unsupported';
  }

  return Notification.permission;
}

export async function requestReminderPermission() {
  if (isNativeMobilePlatform()) {
    const permissions = await LocalNotifications.requestPermissions();
    if (permissions.display === 'granted') {
      await ensureAndroidChannel();
    }
    return permissions.display || 'prompt';
  }

  if (!('Notification' in window)) {
    return 'unsupported';
  }

  return Notification.requestPermission();
}

// Android 12+ only delivers on time with the "Alarms & reminders" permission;
// without it the OS may delay reminders, especially in Doze.
export async function getExactAlarmStatus() {
  if (getPlatform() !== 'android') return 'granted';
  try {
    const { exact_alarm: status } = await LocalNotifications.checkExactNotificationSetting();
    return status || 'granted';
  } catch {
    return 'granted';
  }
}

export async function openExactAlarmSettings() {
  if (getPlatform() !== 'android') return 'granted';
  const { exact_alarm: status } = await LocalNotifications.changeExactNotificationSetting();
  return status;
}

async function runSync(alarms, medicines, logs) {
  if (!isNativeMobilePlatform()) {
    return null;
  }

  const permission = await getReminderPermissionStatus();
  if (permission !== 'granted') {
    return null;
  }

  await ensureAndroidChannel();
  await ensureActionTypes();

  const exact = (await getExactAlarmStatus()) === 'granted';
  const { notifications: desired, answeredDoses, skippedAlarmIds } = planNotifications({
    alarms,
    medicines,
    logs,
    now: new Date(),
    exact,
    limit: PENDING_LIMIT[getPlatform()] ?? PENDING_LIMIT.android,
  });

  const { notifications: pending = [] } = await LocalNotifications.getPending();
  const { toCancel, toSchedule } = reconcileNotifications(desired, pending, answeredDoses);

  if (toCancel.length) {
    await LocalNotifications.cancel({ notifications: toCancel.map((id) => ({ id })) });
  }
  if (toSchedule.length) {
    await LocalNotifications.schedule({ notifications: toSchedule.map(toPluginNotification) });
  }

  return {
    planned: desired.length,
    scheduled: toSchedule.length,
    cancelled: toCancel.length,
    skippedAlarmIds,
  };
}

/**
 * Make the OS's pending notifications match the current schedule.
 * Safe to call as often as data changes: runs are serialized and only the
 * difference is cancelled or scheduled.
 */
export function syncNativeAlarmNotifications(alarms = [], medicines = [], logs = []) {
  const run = syncQueue.then(() => runSync(alarms, medicines, logs));
  syncQueue = run.catch(() => {});
  return run;
}

// Above the planner's id range (max ~4e8), so it can never replace a dose reminder.
const TEST_NOTIFICATION_ID = 2_000_000_000;

/** Fires a reminder in a few seconds so the user can check it actually arrives. */
export async function sendTestReminder(seconds = 10) {
  if (!isNativeMobilePlatform()) return false;
  if ((await getReminderPermissionStatus()) !== 'granted') return false;

  await ensureAndroidChannel();
  await LocalNotifications.schedule({
    notifications: [{
      id: TEST_NOTIFICATION_ID,
      title: 'MedAlarm test reminder',
      body: 'Reminders are working on this device.',
      schedule: { at: new Date(Date.now() + seconds * 1000), allowWhileIdle: true },
      channelId: CHANNEL_ID,
      extra: { test: true },
    }],
  });
  return true;
}

export async function scheduleSnoozedReminder({ alarmId, scheduledFor, medicineId, medicineName, dosage, minutes }) {
  if (!isNativeMobilePlatform()) {
    return;
  }

  const permission = await getReminderPermissionStatus();
  if (permission !== 'granted') {
    return;
  }

  await ensureAndroidChannel();
  await ensureActionTypes();

  const now = new Date();
  const fireAt = new Date(now.getTime() + minutes * 60000);
  await LocalNotifications.schedule({
    notifications: [
      toPluginNotification({
        // One snooze per alarm per day: snoozing again replaces the previous one.
        id: notificationId(alarmId, now, NOTIFICATION_KIND.SNOOZE),
        title: `Snoozed reminder: ${medicineName || 'Medication'}`,
        body: dosage ? `Dose: ${dosage}` : 'Open MedAlarm to log your dose.',
        at: fireAt,
        extra: {
          alarmId,
          medicineId,
          // Snoozing keeps the original dose so Taken from the snooze answers it.
          scheduledFor,
          doseDate: scheduledFor ? scheduledFor.slice(0, 10) : localDateKey(now),
          kind: NOTIFICATION_KIND.SNOOZE,
        },
      }),
    ],
  });
}
