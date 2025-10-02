import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SleepTrendChart } from '@/components/charts/SleepTrendChart';
import { useSleepData } from '@/providers/SleepDataProvider';

type Period = 'daily' | 'weekly';

export default function InsightsScreen() {
  const { analytics, sessions } = useSleepData();
  const [period, setPeriod] = useState<Period>('daily');

  const selectedSeries = period === 'daily' ? analytics.daily : analytics.weekly;

  const averageQuality = useMemo(() => {
    if (!sessions.length) {
      return 0;
    }
    const total = sessions.reduce((sum, session) => sum + session.metrics.qualityScore, 0);
    return Number((total / sessions.length).toFixed(1));
  }, [sessions]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="title">แดชบอร์ดการนอน</ThemedText>

      <SummaryRow
        averageQuality={averageQuality}
        totalSessions={sessions.length}
        averageSnoreMinutes={calculateAverageSnoreMinutes(sessions)}
      />

      <SegmentedControl period={period} onChange={setPeriod} />

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">กราฟช่วงเวลา</ThemedText>
        <SleepTrendChart data={selectedSeries} />
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">รายละเอียด</ThemedText>
        <View style={styles.detailList}>
          {selectedSeries.map((item) => (
            <View key={item.dateKey} style={styles.detailRow}>
              <ThemedText type="defaultSemiBold">{item.label}</ThemedText>
              <ThemedText>{item.averageQuality} คะแนน</ThemedText>
              <ThemedText style={styles.subtle}>กรน {item.snoreMinutes} นาที</ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

function SummaryRow({
  averageQuality,
  totalSessions,
  averageSnoreMinutes,
}: {
  averageQuality: number;
  totalSessions: number;
  averageSnoreMinutes: number;
}) {
  return (
    <View style={styles.summaryRow}>
      <SummaryCard label="คะแนนเฉลี่ย" value={`${averageQuality}`} />
      <SummaryCard label="จำนวนคืน" value={`${totalSessions}`} />
      <SummaryCard label="กรนเฉลี่ย" value={`${averageSnoreMinutes} นาที`} />
    </View>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView style={styles.summaryCard}>
      <ThemedText style={styles.subtle}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.summaryValue}>
        {value}
      </ThemedText>
    </ThemedView>
  );
}

function SegmentedControl({ period, onChange }: { period: Period; onChange: (value: Period) => void }) {
  return (
    <View style={styles.segmentedControl}>
      <SegmentButton label="รายวัน" isActive={period === 'daily'} onPress={() => onChange('daily')} />
      <SegmentButton
        label="รายสัปดาห์"
        isActive={period === 'weekly'}
        onPress={() => onChange('weekly')}
      />
    </View>
  );
}

function SegmentButton({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.segmentButton, isActive && styles.segmentButtonActive]} onPress={onPress}>
      <ThemedText type="defaultSemiBold" style={isActive ? styles.segmentLabelActive : undefined}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}


function calculateAverageSnoreMinutes(sessions: ReturnType<typeof useSleepData>['sessions']): number {
  if (!sessions.length) {
    return 0;
  }
  const total = sessions.reduce((sum, session) => sum + session.metrics.snoreMinutes, 0);
  return Number((total / sessions.length).toFixed(1));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  summaryValue: {
    fontSize: 18,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: 'rgba(10, 126, 164, 0.12)',
  },
  segmentLabelActive: {
    color: '#0a7ea4',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  detailList: {
    gap: 12,
  },
  detailRow: {
    gap: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    paddingBottom: 8,
  },
  subtle: {
    opacity: 0.7,
  },
});
