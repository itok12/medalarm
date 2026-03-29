import { LocalNotifications } from '@capacitor/local-notifications';
import { isNativeMobilePlatform } from './nativePlatform';
import { buildUpcomingAlarmInstances } from '../utils/alarmTimeline';

const CHANNEL_ID = 'medalarm-reminders';

function buildMedicineLookup(medicines = []) {
  const map = new Map();
  medicines.forEach((medicine) => map.set(medicine.id, medicine));
  return map;
}

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

export async function syncNativeAlarmNotifications(alarms = [], medicines = []) {
  if (!isNativeMobilePlatform()) {
    return;
  }

  const permission = await getReminderPermissionStatus();
  if (permission !== 'granted') {
    return;
  }

  await ensureAndroidChannel();

  const pending = await LocalNotifications.getPending();
  if (pending.notifications?.length) {
    await LocalNotifications.cancel({ notifications: pending.notifications.map(({ id }) => ({ id })) });
  }

  const medicineLookup = buildMedicineLookup(medicines);
  const notifications = buildUpcomingAlarmInstances(alarms, 7).map(({ alarm, scheduledFor }, index) => {
    const medicine = medicineLookup.get(alarm.medicineId);
    const medicineName = medicine?.name || 'your medicine';

    return {
      id: alarm.id * 100 + index + 1,
      title: `Time to take ${medicineName}`,
      body: medicine?.dosage ? `Dose: ${medicine.dosage}` : 'Open MedAlarm to mark this dose.',
      schedule: {
        at: scheduledFor,
        allowWhileIdle: true,
      },
      channelId: CHANNEL_ID,
      extra: {
        alarmId: alarm.id,
        medicineId: alarm.medicineId,
      },
    };
  });

  if (notifications.length) {
    await LocalNotifications.schedule({ notifications });
  }
}

export async function scheduleSnoozedReminder({ alarmId, medicineName, dosage, minutes }) {
  if (!isNativeMobilePlatform()) {
    return;
  }

  const permission = await getReminderPermissionStatus();
  if (permission !== 'granted') {
    return;
  }

  await ensureAndroidChannel();

  const fireAt = new Date(Date.now() + minutes * 60000);
  await LocalNotifications.schedule({
    notifications: [
      {
        id: alarmId * 100000 + 99,
        title: `Snoozed reminder: ${medicineName || 'Medication'}`,
        body: dosage ? `Dose: ${dosage}` : 'Open MedAlarm to log your dose.',
        schedule: {
          at: fireAt,
          allowWhileIdle: true,
        },
        channelId: CHANNEL_ID,
        extra: {
          alarmId,
          snoozed: true,
        },
      },
    ],
  });
}
