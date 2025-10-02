export type SnoreEvent = {
  id: string;
  startOffsetSec: number;
  durationSec: number;
  intensityDb: number;
};

export type SleepMetrics = {
  totalDurationMinutes: number;
  snoreMinutes: number;
  snorePercentage: number;
  peakDb: number;
  averageDb: number;
  qualityScore: number;
};

export type SleepSession = {
  id: string;
  startedAt: string;
  endedAt?: string;
  notes?: string;
  snoreEvents: SnoreEvent[];
  metrics: SleepMetrics;
};

export type AggregatedPoint = {
  label: string;
  dateKey: string;
  averageQuality: number;
  snoreMinutes: number;
};

export type SleepAnalytics = {
  daily: AggregatedPoint[];
  weekly: AggregatedPoint[];
};
