import { registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getPlatform, isNativeMobilePlatform } from './nativePlatform';
import { getExactAlarmStatus, getReminderPermissionStatus } from './reminderService';

// Native side: android/app/src/main/java/com/medalarm/app/ReminderHealthPlugin.java
const ReminderHealth = registerPlugin('ReminderHealth');

/**
 * Everything that decides whether a reminder fires on time on this device,
 * gathered for the Settings > Reminder health card.
 */
export async function getReminderHealth() {
  if (!isNativeMobilePlatform()) {
    return { native: false };
  }

  const [permission, exactAlarm, pending, device] = await Promise.all([
    getReminderPermissionStatus(),
    getExactAlarmStatus(),
    LocalNotifications.getPending().then((result) => result.notifications ?? []).catch(() => []),
    getPlatform() === 'android'
      ? ReminderHealth.getStatus().catch(() => null)
      : Promise.resolve(null),
  ]);

  const upcoming = pending
    .filter((notification) => !notification.extra?.test)
    // Planner notifications carry the exact epoch time in their signature; the
    // plugin returns schedule.at as an Android date string.
    .map((notification) => ({
      ...notification,
      at: notification.extra?.sig
        ? new Date(Number(String(notification.extra.sig).split('|')[0]))
        : new Date(notification.schedule?.at),
    }))
    .filter((notification) => !Number.isNaN(notification.at.getTime()))
    .sort((left, right) => left.at - right.at);

  return {
    native: true,
    permission,
    exactAlarm,
    batteryOptimized: device?.batteryOptimized ?? false,
    channelEnabled: device?.channelEnabled ?? true,
    manufacturer: device?.manufacturer ?? '',
    pendingCount: upcoming.length,
    next: upcoming[0] ?? null,
  };
}

export function openBatterySettings() {
  return ReminderHealth.openBatterySettings();
}
