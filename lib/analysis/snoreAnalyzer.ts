import { SleepMetrics, SnoreEvent } from '@/types/sleep';

export type SnoreAnalysisResult = {
  metrics: SleepMetrics;
  events: SnoreEvent[];
};

type AnalyzeOptions = {
  uri: string;
  durationMinutes: number;
  averageDb?: number;
};

export async function analyzeSnoreRecording({
  uri,
  durationMinutes,
  averageDb = 55,
}: AnalyzeOptions): Promise<SnoreAnalysisResult> {
  console.log('[snoreAnalyzer] analyzing file', uri);

  const simulatedEvents = synthesizeSnoreEvents(durationMinutes);

  const snoreMinutes = simulatedEvents.reduce((total, event) => total + event.durationSec, 0) / 60;
  const peakDb = simulatedEvents.reduce((max, event) => Math.max(max, event.intensityDb), averageDb + 10);
  const snorePercentage = durationMinutes > 0 ? (snoreMinutes / durationMinutes) * 100 : 0;
  const qualityScore = scoreSleepQuality({ snoreMinutes, durationMinutes, averageDb, peakDb });

  return {
    metrics: {
      totalDurationMinutes: Number(durationMinutes.toFixed(1)),
      snoreMinutes: Number(snoreMinutes.toFixed(1)),
      snorePercentage: Number(snorePercentage.toFixed(1)),
      peakDb: Number(peakDb.toFixed(0)),
      averageDb: Number(averageDb.toFixed(0)),
      qualityScore: Number(qualityScore.toFixed(0)),
    },
    events: simulatedEvents,
  };
}

function synthesizeSnoreEvents(durationMinutes: number): SnoreEvent[] {
  const durationSeconds = durationMinutes * 60;
  const segments = Math.max(1, Math.round(durationMinutes / 60 * 3));
  const events: SnoreEvent[] = [];

  for (let index = 0; index < segments; index += 1) {
    const startOffsetSec = (durationSeconds / (segments + 1)) * (index + 1);
    const intensityDb = 50 + Math.random() * 25;
    const durationSec = 10 + Math.random() * 40;
    events.push({
      id: `event-${index}`,
      startOffsetSec,
      durationSec,
      intensityDb,
    });
  }

  return events;
}

function scoreSleepQuality({
  snoreMinutes,
  durationMinutes,
  averageDb,
  peakDb,
}: {
  snoreMinutes: number;
  durationMinutes: number;
  averageDb: number;
  peakDb: number;
}): number {
  const snoreRatio = durationMinutes ? snoreMinutes / durationMinutes : 0;
  const intensityPenalty = Math.max(0, (averageDb - 45) / 35);
  const peakPenalty = Math.max(0, (peakDb - 65) / 25);
  const rawScore = 100 - snoreRatio * 60 - intensityPenalty * 20 - peakPenalty * 15;
  return Math.min(95, Math.max(40, rawScore));
}
