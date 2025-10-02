import { AggregatedPoint, SleepSession } from '@/types/sleep';

type Grouped = Record<string, SleepSession[]>;

export function buildDailySeries(sessions: SleepSession[]): AggregatedPoint[] {
  const groups = groupSessions(sessions, (session) => toDateKey(session.startedAt));
  return toAggregatedPoints(groups);
}

export function buildWeeklySeries(sessions: SleepSession[]): AggregatedPoint[] {
  const groups = groupSessions(sessions, (session) => toWeekKey(session.startedAt));
  return toAggregatedPoints(groups, { labelPrefix: 'สัปดาห์ที่เริ่ม ' });
}

function groupSessions(
  sessions: SleepSession[],
  getKey: (session: SleepSession) => string,
): Grouped {
  return sessions.reduce<Grouped>((collection, session) => {
    const key = getKey(session);
    if (!collection[key]) {
      collection[key] = [];
    }
    collection[key].push(session);
    return collection;
  }, {});
}

function toAggregatedPoints(
  groups: Grouped,
  options: { labelPrefix?: string } = {},
): AggregatedPoint[] {
  const formatter = new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
  });

  return Object.entries(groups)
    .map(([dateKey, items]) => {
      const averageQuality = average(items.map((session) => session.metrics.qualityScore));
      const snoreMinutes = sum(items.map((session) => session.metrics.snoreMinutes));

      const labelDate = new Date(dateKey);
      const label = `${options.labelPrefix ?? ''}${formatter.format(labelDate)}`;

      return {
        label,
        dateKey,
        averageQuality: Number(averageQuality.toFixed(1)),
        snoreMinutes: Number(snoreMinutes.toFixed(1)),
      } satisfies AggregatedPoint;
    })
    .sort((a, b) => (a.dateKey < b.dateKey ? -1 : 1));
}

function toDateKey(value: string): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toWeekKey(value: string): string {
  const date = new Date(value);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - (day - 1));
  return toDateKey(date.toISOString());
}

function average(values: number[]): number {
  if (!values.length) {
    return 0;
  }
  return sum(values) / values.length;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
