import { SleepSession } from '@/types/sleep';

/**
 * Simple rule-based assessment translated from user's logic.
 * Returns a short Thai message describing risk/observation.
 */
export function analyzeSnore(snoreCount: number, avgDb: number, silentGap: number): string {
  if (avgDb > 60) {
    return 'กรนเสียงดัง มีโอกาสรบกวนการนอน';
  }

  if (snoreCount > 30) {
    return 'มีความเสี่ยงสูงต่อภาวะหยุดหายใจขณะหลับ';
  }

  if (silentGap > 10) {
    return 'พบช่วงเงียบเกิน 10 วินาที → อาจเสี่ยง OSA';
  }

  return 'การกรนอยู่ในเกณฑ์เบื้องต้นปกติ';
}

function computeMaxSilentGapSeconds(session: SleepSession): number {
  const events = [...session.snoreEvents].sort((a, b) => a.startOffsetSec - b.startOffsetSec);
  const totalSeconds = Math.max(0, Math.round((session.metrics.totalDurationMinutes || 0) * 60));

  if (!events.length) {
    // No events recorded — treat entire session as a single silent gap
    return totalSeconds;
  }

  let maxGap = 0;
  // gap before first event
  const firstGap = Math.max(0, events[0].startOffsetSec);
  maxGap = Math.max(maxGap, firstGap);

  for (let i = 1; i < events.length; i += 1) {
    const prev = events[i - 1];
    const cur = events[i];
    const prevEnd = prev.startOffsetSec + prev.durationSec;
    const gap = Math.max(0, cur.startOffsetSec - prevEnd);
    maxGap = Math.max(maxGap, gap);
  }

  // gap after last event
  const last = events[events.length - 1];
  const lastEnd = last.startOffsetSec + last.durationSec;
  const tailGap = Math.max(0, totalSeconds - lastEnd);
  maxGap = Math.max(maxGap, tailGap);

  return Math.round(maxGap);
}

export function assessSession(session: SleepSession): string {
  const snoreCount = session.snoreEvents ? session.snoreEvents.length : 0;
  const avgDb = session.metrics?.averageDb ?? 0;
  const silentGap = computeMaxSilentGapSeconds(session);

  return analyzeSnore(snoreCount, avgDb, silentGap);
}
