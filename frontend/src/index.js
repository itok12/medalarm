import React from 'react';
import ReactDOM from 'react-dom/client';
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
