import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  loadSettings,
  persistSettings,
  resetStoredSettings,
} from './settingsStorage';

describe('settingsStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when nothing is stored', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('merges partial stored settings with defaults', () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ compactView: true }));
    expect(loadSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      compactView: true,
    });
  });

  it('falls back to defaults when storage is invalid', () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, '{bad json');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('persists and resets settings', () => {
    persistSettings({ ...DEFAULT_SETTINGS, snoozeDurationMinutes: 15 });
    expect(JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY))).toEqual({
      ...DEFAULT_SETTINGS,
      snoozeDurationMinutes: 15,
    });

    expect(resetStoredSettings()).toEqual(DEFAULT_SETTINGS);
    expect(JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY))).toEqual(DEFAULT_SETTINGS);
  });
});
