#!/usr/bin/env node
// Fails the mobile build when the native app would not be able to reach the backend.
// Loads env files with the same precedence react-scripts uses for `npm run build`.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// Earlier files win and real environment variables win over all files, as in dotenv.
function loadEnvFile(file) {
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match || line.trim().startsWith('#')) return;
    const [, key, rawValue = ''] = match;
    if (process.env[key] === undefined) {
      process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, '$2');
    }
  });
}

['.env.production.local', '.env.local', '.env.production', '.env']
  .map((file) => path.join(root, file))
  .filter((file) => fs.existsSync(file))
  .forEach(loadEnvFile);

const value = (process.env.REACT_APP_NATIVE_API_BASE_URL || '').trim();

function fail(message) {
  console.error(`\n[assert-native-config] ${message}\n`);
  process.exit(1);
}

if (!value) {
  fail('REACT_APP_NATIVE_API_BASE_URL is not set. Native builds cannot use a relative /api URL.');
}

let url;
try {
  url = new URL(value);
} catch {
  fail(`REACT_APP_NATIVE_API_BASE_URL is not an absolute URL: "${value}"`);
}

const isLocalDev = ['10.0.2.2', 'localhost', '127.0.0.1'].includes(url.hostname);
if (url.protocol !== 'https:' && !isLocalDev) {
  fail(`REACT_APP_NATIVE_API_BASE_URL must use https (got "${value}").`);
}

console.log(`[assert-native-config] Native API base URL: ${value}`);
