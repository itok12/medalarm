import * as Sentry from '@sentry/react';

const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;
const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;
const TELEMETRY_ENVIRONMENT =
  process.env.REACT_APP_RELEASE_CHANNEL || process.env.NODE_ENV || 'development';
const APP_VERSION = process.env.REACT_APP_APP_VERSION || 'dev';

let initialized = false;
let globalListenersBound = false;
let gaInitialized = false;
let pendingUserId = null;
const pendingEvents = [];

function injectAnalyticsScript() {
  if (!GA_MEASUREMENT_ID || typeof document === 'undefined') {
    return;
  }

  if (document.querySelector('script[data-medalarm-ga="true"]')) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.dataset.medalarmGa = 'true';
  script.onload = () => {
    gaInitialized = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer.push(arguments);
      };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
      app_name: 'MedAlarm',
      app_version: APP_VERSION,
      user_id: pendingUserId || undefined,
    });
    pendingEvents.splice(0).forEach(({ name, params }) => {
      window.gtag('event', name, params);
    });
  };
  document.head.appendChild(script);
}

function emitAnalyticsEvent(name, params = {}) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') {
    return;
  }

  if (!gaInitialized || typeof window.gtag !== 'function') {
    pendingEvents.push({ name, params });
    return;
  }

  window.gtag('event', name, params);
}

function bindGlobalListeners() {
  if (globalListenersBound || typeof window === 'undefined') {
    return;
  }

  globalListenersBound = true;

  window.addEventListener('error', (event) => {
    captureException(event.error || new Error(event.message), {
      source: 'window.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    captureException(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { source: 'window.unhandledrejection' }
    );
  });
}

export function initializeTelemetry() {
  if (initialized) {
    return;
  }

  initialized = true;
  bindGlobalListeners();
  injectAnalyticsScript();

  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: TELEMETRY_ENVIRONMENT,
      release: `medalarm-frontend@${APP_VERSION}`,
      enabled: true,
    });
  }
}

export function setTelemetryUser(user) {
  pendingUserId = user?.userId ? String(user.userId) : null;

  if (SENTRY_DSN) {
    Sentry.setUser(
      user
        ? {
            id: String(user.userId),
            email: user.email || undefined,
            username: user.username || undefined,
          }
        : null
    );
  }

  if (
    gaInitialized &&
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function' &&
    GA_MEASUREMENT_ID
  ) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
      app_name: 'MedAlarm',
      app_version: APP_VERSION,
      user_id: pendingUserId || undefined,
    });
  }
}

export function trackEvent(name, params = {}) {
  emitAnalyticsEvent(name, params);
}

export function trackScreenView(pathname, title) {
  if (!pathname) {
    return;
  }

  emitAnalyticsEvent('page_view', {
    page_path: pathname,
    page_title: title || pathname,
    page_location: typeof window !== 'undefined' ? window.location.href : pathname,
  });
}

export function captureException(error, context = {}) {
  const resolvedError = error instanceof Error ? error : new Error(String(error));

  if (SENTRY_DSN) {
    Sentry.captureException(resolvedError, {
      extra: context,
    });
  } else {
    console.error('Captured exception:', resolvedError, context);
  }
}
