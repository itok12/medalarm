import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medalarm.app',
  appName: 'MedAlarm',
  webDir: 'build',
  bundledWebRuntime: false,
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
