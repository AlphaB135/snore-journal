import AsyncStorage from '@react-native-async-storage/async-storage';

import { SleepSession } from '@/types/sleep';

const STORAGE_KEY = '@snore-journal/sessions';

export async function loadSessions(): Promise<SleepSession[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as SleepSession[];
    return parsed;
  } catch (error) {
    console.error('[sleepRepository.loadSessions]', error);
    return [];
  }
}

export async function saveSessions(sessions: SleepSession[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('[sleepRepository.saveSessions]', error);
    throw error;
  }
}

export async function upsertSession(session: SleepSession): Promise<SleepSession[]> {
  const sessions = await loadSessions();
  const existingIndex = sessions.findIndex((item) => item.id === session.id);

  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }

  await saveSessions(sessions);
  return sessions;
}

export async function deleteSession(id: string): Promise<SleepSession[]> {
  const sessions = await loadSessions();
  const nextSessions = sessions.filter((session) => session.id !== id);
  await saveSessions(nextSessions);
  return nextSessions;
}

export async function clearSessions(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[sleepRepository.clearSessions]', error);
    throw error;
  }
}
