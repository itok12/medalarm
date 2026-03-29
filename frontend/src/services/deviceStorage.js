import { Preferences } from '@capacitor/preferences';
import { isNativePlatform } from './nativePlatform';

async function getValue(key) {
  if (isNativePlatform()) {
    const { value } = await Preferences.get({ key });
    return value;
  }
  return localStorage.getItem(key);
}

async function setValue(key, value) {
  if (isNativePlatform()) {
    await Preferences.set({ key, value });
    return;
  }
  localStorage.setItem(key, value);
}

export async function removeValue(key) {
  if (isNativePlatform()) {
    await Preferences.remove({ key });
    return;
  }
  localStorage.removeItem(key);
}

export async function getJson(key, fallback = null) {
  try {
    const value = await getValue(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export async function setJson(key, value) {
  await setValue(key, JSON.stringify(value));
}
