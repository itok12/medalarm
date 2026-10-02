// Only URL resolution is under test; stub the HTTP client and the guest store.
jest.mock('axios', () => ({
  create: () => ({ interceptors: { request: { use: () => {} }, response: { use: () => {} } } }),
  post: jest.fn(),
}));
jest.mock('./guestDataService', () => ({}));

const ORIGINAL_ENV = process.env;

function loadResolver({ native, env = {} }) {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV, ...env };
  window.Capacitor = native ? { isNativePlatform: () => true } : undefined;
  window.__MEDALARM_RUNTIME_CONFIG__ = { API_BASE_URL: '' };
  // eslint-disable-next-line global-require
  return require('./api').resolveApiBaseUrl;
}

afterEach(() => {
  process.env = ORIGINAL_ENV;
  delete window.Capacitor;
  delete window.__MEDALARM_RUNTIME_CONFIG__;
});

describe('resolveApiBaseUrl', () => {
  it('uses the absolute native URL in native production builds', () => {
    const resolve = loadResolver({
      native: true,
      env: { NODE_ENV: 'production', REACT_APP_NATIVE_API_BASE_URL: 'https://medalarmapp.com/api' },
    });
    expect(resolve()).toBe('https://medalarmapp.com/api');
  });

  it('never falls back to a relative /api on native, even if the web URL is set', () => {
    const resolve = loadResolver({
      native: true,
      env: { NODE_ENV: 'production', REACT_APP_API_BASE_URL: '/api', REACT_APP_NATIVE_API_BASE_URL: '' },
    });
    expect(resolve()).toBe('');
  });

  it('targets the emulator host loopback in native development', () => {
    const resolve = loadResolver({ native: true, env: { NODE_ENV: 'development' } });
    expect(resolve()).toBe('http://10.0.2.2:8080/api');
  });

  it('keeps same-origin /api for the web build', () => {
    const resolve = loadResolver({
      native: false,
      env: { NODE_ENV: 'production', REACT_APP_API_BASE_URL: '/api', REACT_APP_NATIVE_API_BASE_URL: 'https://medalarmapp.com/api' },
    });
    expect(resolve()).toBe('/api');
  });
});
