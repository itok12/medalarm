import React from 'react';
import ReactDOM from 'react-dom/client';
// Bundled font: a remote Google Fonts @import blocked first paint for ~20 s offline.
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import './index.css';
import App from './App';
import { register } from './serviceWorkerRegistration';
import AppErrorBoundary from './components/Common/AppErrorBoundary';
import { initializeTelemetry } from './services/telemetry';

initializeTelemetry();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);

register();
