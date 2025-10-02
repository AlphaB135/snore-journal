import { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { assessSession } from '@/lib/analysis/healthAssessment';
import { useSleepData } from '@/providers/SleepDataProvider';
import { SleepSession } from '@/types/sleep';

export default function OverviewScreen() {
  const { sessions, analytics, isLoading, refresh, seedDemoData } = useSleepData();

  const orderedSessions = useMemo(() => sortSessions(sessions), [sessions]);
  const latestSession = orderedSessions[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="always">
        <ThemedText type="title" style={styles.title}>
          บันทึกการนอนของคุณ
        </ThemedText>

        {latestSession ? (
          <LatestSessionCard session={latestSession} />
        ) : (
          <EmptyState onSeed={seedDemoData} />
        )}

        <TrendSection label="แนวโน้มรายวัน" data={analytics.daily.slice(-7)} />
        <TrendSection label="แนวโน้มรายสัปดาห์" data={analytics.weekly.slice(-6)} />

        <RecentSessionsList sessions={orderedSessions.slice(0, 5)} />
      </ScrollView>
    </SafeAreaView>
  );
}

function LatestSessionCard({ session }: { session: SleepSession }) {
  return (
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle">คืนล่าสุด</ThemedText>
      <ThemedText
        style={styles.primaryValue}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {session.metrics.qualityScore}
      </ThemedText>
      <ThemedText type="defaultSemiBold">คะแนนคุณภาพการนอน</ThemedText>
      <View style={styles.metricsRow}>
        <MetricItem label="ชั่วโมงหลับ" value={minutesToHours(session.metrics.totalDurationMinutes)} />
        <MetricItem label="นาทีกรน" value={`${session.metrics.snoreMinutes.toFixed(1)} นาที`} />
        <MetricItem label="ระดับเสียงเฉลี่ย" value={`${session.metrics.averageDb.toFixed(0)} dB`} />
      </View>
      {session.notes ? <ThemedText style={styles.note}>💡 {session.notes}</ThemedText> : null}
      <ThemedText style={styles.assessment}>
        {assessSession(session)}
      </ThemedText>
    </ThemedView>
  );
}

function TrendSection({
  label,
  data,
}: {
  label: string;
  data: ReturnType<typeof useSleepData>['analytics']['daily'];
}) {
  if (!data.length) {
    return null;
  }

  return (
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle">{label}</ThemedText>
      <View style={styles.trendList}>
        {data.map((item) => (
          <View key={item.dateKey} style={styles.trendItem}>
            <ThemedText type="defaultSemiBold">{item.label}</ThemedText>
            <ThemedText>{item.averageQuality} คะแนน</ThemedText>
            <ThemedText style={styles.subtle}>กรน {item.snoreMinutes} นาที</ThemedText>
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

function RecentSessionsList({ sessions }: { sessions: SleepSession[] }) {
  if (!sessions.length) {
    return null;
  }

  return (
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle">บันทึกล่าสุด</ThemedText>
      <View style={styles.sessionsList}>
        {sessions.map((session) => (
          <View key={session.id} style={styles.sessionRow}>
            <View>
              <ThemedText type="defaultSemiBold">
                {formatDate(session.startedAt)}
              </ThemedText>
              <ThemedText style={styles.subtle}>
                {minutesToHours(session.metrics.totalDurationMinutes)}
              </ThemedText>
            </View>
            <View style={styles.sessionMetrics}>
              <ThemedText type="defaultSemiBold">
                {session.metrics.qualityScore}
              </ThemedText>
              <ThemedText style={styles.subtle}>
                {session.metrics.snoreMinutes.toFixed(1)} นาทีกรน
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

function EmptyState({ onSeed }: { onSeed: () => Promise<void> }) {
  return (
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle">ยังไม่มีข้อมูล</ThemedText>
      <ThemedText>เริ่มบันทึกเสียงกรนของคุณเพื่อดูสถิติ</ThemedText>
      <Button label="โหลดข้อมูลตัวอย่าง" onPress={onSeed} />
    </ThemedView>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricItem}>
      <ThemedText style={styles.subtle}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold">{value}</ThemedText>
    </View>
  );
}

function sortSessions(sessions: SleepSession[]): SleepSession[] {
  return [...sessions].sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
}

function minutesToHours(minutes: number): string {
  const hours = minutes / 60;
  return `${hours.toFixed(1)} ชั่วโมง`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 16,
  },
  title: {
    marginBottom: 4,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    gap: 4,
  },
  primaryValue: {
    fontSize: 58,
    lineHeight: 64,
    fontWeight: '800',
    flexShrink: 1,
    maxWidth: '100%',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },

  trendList: {
    gap: 12,
  },
  trendItem: {
    borderRadius: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    gap: 2,
  },
  sessionsList: {
    gap: 12,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionMetrics: {
    alignItems: 'flex-end',
  },
  subtle: {
    opacity: 0.7,
  },
  note: {
    fontStyle: 'italic',
    opacity: 0.8,
  },
  assessment: {
    marginTop: 8,
    fontStyle: 'normal',
    opacity: 0.95,
  },
});
