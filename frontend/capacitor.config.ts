import type { CapacitorConfig } from '@capacitor/cli';

// The WebView serves the app from https://localhost (Capacitor's default scheme).
// To hit a plain-http backend on the emulator (http://10.0.2.2:8080), sync with
// CAP_ALLOW_MIXED_CONTENT=true; never ship a release built that way.
const allowMixedContent = process.env.CAP_ALLOW_MIXED_CONTENT === 'true';

const config: CapacitorConfig = {
  appId: 'com.medalarm.app',
  appName: 'MedAlarm',
  webDir: 'build',
  android: {
    allowMixedContent,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      showSpinner: false,
      backgroundColor: '#0d47a1',
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
