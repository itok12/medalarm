import { Preferences } from '@capacitor/preferences';
import { isNativeMobilePlatform } from './nativePlatform';

// The Android/iOS WebView blocks the backend's refresh cookie (it is a
// cross-site cookie from the app's point of view), so native builds keep the
// refresh token in app-private storage and send it in the request body.
// Web builds keep using the HttpOnly cookie and never see the token.
const REFRESH_TOKEN_KEY = 'medalarm-refresh-token';

export const CLIENT_HEADER = 'X-MedAlarm-Client';

export async function getNativeRefreshToken() {
  if (!isNativeMobilePlatform()) return null;
  const { value } = await Preferences.get({ key: REFRESH_TOKEN_KEY });
  return value || null;
}

export async function saveNativeRefreshToken(token) {
  if (!isNativeMobilePlatform() || !token) return;
  await Preferences.set({ key: REFRESH_TOKEN_KEY, value: token });
}

export async function clearNativeRefreshToken() {
  if (!isNativeMobilePlatform()) return;
  await Preferences.remove({ key: REFRESH_TOKEN_KEY });
}
