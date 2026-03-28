import {
  SNOOZE_STORAGE_KEY,
  getSnoozeUntil,
  persistSnoozes,
  readStoredSnoozes,
} from './alarmSnoozeStorage';

describe('alarmSnoozeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty map for invalid data', () => {
    localStorage.setItem(SNOOZE_STORAGE_KEY, '{bad json');
    expect(readStoredSnoozes()).toEqual(new Map());
  });

  it('round-trips snooze timestamps through localStorage', () => {
    persistSnoozes(new Map([
      ['12', 1234567890],
      ['18', 9876543210],
    ]));

    const snoozes = readStoredSnoozes();
    expect(getSnoozeUntil(snoozes, 12)).toBe(1234567890);
    expect(getSnoozeUntil(snoozes, 18)).toBe(9876543210);
    expect(getSnoozeUntil(snoozes, 99)).toBe(0);
  });
});
