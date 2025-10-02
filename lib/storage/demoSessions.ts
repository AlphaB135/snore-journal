import { SleepSession } from '@/types/sleep';

export const demoSessions: SleepSession[] = [
  {
    id: 'demo-1',
    startedAt: new Date().toISOString(),
    endedAt: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    notes: 'ค่ำคืนทดสอบที่บ้าน',
    snoreEvents: [
      { id: 'demo-1-a', startOffsetSec: 120, durationSec: 22, intensityDb: 58 },
      { id: 'demo-1-b', startOffsetSec: 2_400, durationSec: 18, intensityDb: 62 },
    ],
    metrics: {
      totalDurationMinutes: 420,
      snoreMinutes: 12,
      snorePercentage: 2.9,
      peakDb: 68,
      averageDb: 54,
      qualityScore: 78,
    },
  },
  {
    id: 'demo-2',
    startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 6.5 * 60 * 60 * 1000).toISOString(),
    notes: 'นอนหลับยากเล็กน้อย',
    snoreEvents: [
      { id: 'demo-2-a', startOffsetSec: 600, durationSec: 40, intensityDb: 65 },
      { id: 'demo-2-b', startOffsetSec: 3_600, durationSec: 25, intensityDb: 70 },
      { id: 'demo-2-c', startOffsetSec: 12_000, durationSec: 15, intensityDb: 60 },
    ],
    metrics: {
      totalDurationMinutes: 390,
      snoreMinutes: 18,
      snorePercentage: 4.6,
      peakDb: 71,
      averageDb: 58,
      qualityScore: 65,
    },
  },
  {
    id: 'demo-3',
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 7.2 * 60 * 60 * 1000).toISOString(),
    notes: 'กลางคืนสงบ ไม่มีเสียงรบกวน',
    snoreEvents: [{ id: 'demo-3-a', startOffsetSec: 1_800, durationSec: 10, intensityDb: 52 }],
    metrics: {
      totalDurationMinutes: 432,
      snoreMinutes: 5,
      snorePercentage: 1.1,
      peakDb: 55,
      averageDb: 49,
      qualityScore: 90,
    },
  },
  {
    id: 'demo-4',
    startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 6.8 * 60 * 60 * 1000).toISOString(),
    notes: 'มีหวัดเล็กน้อย',
    snoreEvents: [
      { id: 'demo-4-a', startOffsetSec: 900, durationSec: 35, intensityDb: 69 },
      { id: 'demo-4-b', startOffsetSec: 10_800, durationSec: 28, intensityDb: 72 },
    ],
    metrics: {
      totalDurationMinutes: 408,
      snoreMinutes: 22,
      snorePercentage: 5.4,
      peakDb: 76,
      averageDb: 61,
      qualityScore: 58,
    },
  },
  {
    id: 'demo-5',
    startedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000).toISOString(),
    notes: 'ทดลองใช้เทปดั้ง',
    snoreEvents: [
      { id: 'demo-5-a', startOffsetSec: 3_000, durationSec: 16, intensityDb: 50 },
    ],
    metrics: {
      totalDurationMinutes: 420,
      snoreMinutes: 6,
      snorePercentage: 1.4,
      peakDb: 55,
      averageDb: 47,
      qualityScore: 88,
    },
  },
];
