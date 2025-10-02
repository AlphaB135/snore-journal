import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { analyzeSnoreRecording } from '@/lib/analysis/snoreAnalyzer';
import { useSleepData } from '@/providers/SleepDataProvider';
import { SleepSession } from '@/types/sleep';

export default function RecorderScreen() {
  const { saveSession, sessions } = useSleepData();
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const lastSession = useMemo(() => {
    if (!sessions.length) {
      return null;
    }
    return [...sessions].sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))[0];
  }, [sessions]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (isRecording && startedAt) {
      timer = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startedAt.getTime()) / 1000));
      }, 1_000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRecording, startedAt]);

  const handleStart = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('ต้องการสิทธิ์ไมโครโฟน', 'กรุณาอนุญาตการใช้งานไมโครโฟนเพื่อบันทึกเสียง');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();

      setRecording(newRecording);
      setStartedAt(new Date());
      setElapsedSeconds(0);
      setIsRecording(true);
    } catch (error) {
      console.error(error);
      Alert.alert('เริ่มบันทึกไม่สำเร็จ', 'โปรดลองอีกครั้ง');
    }
  }, []);

  const handleCancel = useCallback(async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (error) {
        console.warn('cancel recording error', error);
      }
    }

    setStartedAt(null);
    setIsRecording(false);
    setElapsedSeconds(0);
    setRecording(null);
  }, [recording]);

  const handleStop = useCallback(async () => {
    if (!startedAt || !recording) {
      return;
    }

    const recordingRef = recording;
    const endedAt = new Date();

    try {
      await recordingRef.stopAndUnloadAsync();
      const status = await recordingRef.getStatusAsync();
      const uri = recordingRef.getURI();

      if (!uri) {
        Alert.alert('บันทึกไม่สำเร็จ', 'ระบบไม่ส่งไฟล์เสียงกลับมา กรุณาลองใหม่อีกครั้ง');
        return;
      }

      const fallbackDurationMillis = Math.max(1, (endedAt.getTime() - startedAt.getTime()));
      const durationMinutes = (status.durationMillis ?? fallbackDurationMillis) / (1000 * 60);

      const analysis = await analyzeSnoreRecording({
        uri,
        durationMinutes,
      });

      const newSession: SleepSession = {
        id: generateId('session'),
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        notes,
        snoreEvents: analysis.events,
        metrics: analysis.metrics,
      };

      await saveSession(newSession);
      setNotes('');
      Alert.alert('บันทึกสำเร็จ', 'เพิ่มบันทึกการนอนใหม่แล้ว');
    } catch (error) {
      console.error(error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setIsRecording(false);
      setStartedAt(null);
      setRecording(null);
      setElapsedSeconds(0);
    }
  }, [notes, recording, saveSession, startedAt]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.header}>
          บันทึกเสียงกรน
        </ThemedText>
      <ThemedText style={styles.description}>
        แตะปุ่มเริ่มบันทึกเพื่อเริ่มจับเสียงระหว่างนอน แอพจะเก็บข้อมูลไว้ในเครื่องของคุณและสามารถวิเคราะห์เป็นกราฟได้ภายหลัง
      </ThemedText>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">สถานะ</ThemedText>
        <StatusBadge isRecording={isRecording} elapsedSeconds={elapsedSeconds} />
        <View style={styles.buttonRow}>
          {isRecording ? (
            <>
              <Button label="หยุดและบันทึก" onPress={handleStop} />
              <Button label="ยกเลิก" onPress={handleCancel} />
            </>
          ) : (
            <Button label="เริ่มบันทึก" onPress={handleStart} />
          )}
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">บันทึกเพิ่มเติม</ThemedText>
        <ThemedText style={styles.description}>เช่น ใช้อุปกรณ์เสริม หรือรู้สึกอย่างไรตอนตื่น</ThemedText>
        <TextInput
          style={styles.textInput}
          placeholder="พิมพ์บันทึก..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ThemedView>

      {lastSession ? (
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">ครั้งล่าสุด</ThemedText>
          <ThemedText>
            {formatDateTime(lastSession.startedAt)} - {formatDateTime(lastSession.endedAt ?? lastSession.startedAt)}
          </ThemedText>
          <ThemedText style={styles.description}>
            คะแนนคุณภาพ {lastSession.metrics.qualityScore} | กรน {lastSession.metrics.snoreMinutes.toFixed(1)} นาที
          </ThemedText>
        </ThemedView>
      ) : null}
      </ThemedView>
    </SafeAreaView>
  );
}

function StatusBadge({ isRecording, elapsedSeconds }: { isRecording: boolean; elapsedSeconds: number }) {
  return (
    <View style={[styles.badge, { backgroundColor: isRecording ? '#ff4d4f' : '#48c774' }]}>
      <ThemedText style={styles.badgeLabel}>
        {isRecording ? `กำลังบันทึก • ${formatDuration(elapsedSeconds)}` : 'พร้อมบันทึก'}
      </ThemedText>
    </View>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function generateId(namespace: string): string {
  return `${namespace}-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  description: {
    opacity: 0.8,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  textInput: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.15)',
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeLabel: {
    color: '#fff',
    fontWeight: '600',
  },
});
