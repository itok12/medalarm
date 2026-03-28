import { buildAdherenceChartData } from './adherenceChart';

describe('buildAdherenceChartData', () => {
  it('maps taken and skipped logs into the trailing seven days', () => {
    const data = buildAdherenceChartData([
      { status: 'TAKEN', takenAt: '2026-03-28T08:00:00' },
      { status: 'TAKEN', takenAt: '2026-03-28T09:00:00' },
      { status: 'SKIPPED', takenAt: '2026-03-27T09:00:00' },
      { status: 'SNOOZED', takenAt: '2026-03-27T10:00:00' },
    ], new Date('2026-03-28T12:00:00'));

    expect(data).toHaveLength(7);
    expect(data[data.length - 1]).toEqual({
      date: '2026-03-28',
      label: 'Sat',
      TAKEN: 2,
      SKIPPED: 0,
    });
    expect(data[data.length - 2]).toEqual({
      date: '2026-03-27',
      label: 'Fri',
      TAKEN: 0,
      SKIPPED: 1,
    });
  });
});
