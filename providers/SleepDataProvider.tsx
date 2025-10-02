import React, { PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { buildDailySeries, buildWeeklySeries } from '@/lib/analysis/aggregators';
import { demoSessions } from '@/lib/storage/demoSessions';
import {
  deleteSession,
  loadSessions,
  saveSessions,
  upsertSession,
} from '@/lib/storage/sleepRepository';
import { AggregatedPoint, SleepSession } from '@/types/sleep';

type SleepDataContextValue = {
  sessions: SleepSession[];
  analytics: {
    daily: AggregatedPoint[];
    weekly: AggregatedPoint[];
  };
  isLoading: boolean;
  refresh: () => Promise<void>;
  saveSession: (session: SleepSession) => Promise<void>;
  removeSession: (id: string) => Promise<void>;
  seedDemoData: () => Promise<void>;
};

const SleepDataContext = React.createContext<SleepDataContextValue | null>(null);

export function SleepDataProvider({ children }: PropsWithChildren) {
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const analytics = useMemo(
    () => ({
      daily: buildDailySeries(sessions),
      weekly: buildWeeklySeries(sessions),
    }),
    [sessions],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const data = await loadSessions();
    setSessions(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveSessionHandler = useCallback(async (session: SleepSession) => {
    setIsLoading(true);
    const data = await upsertSession(session);
    setSessions(data);
    setIsLoading(false);
  }, []);

  const removeSessionHandler = useCallback(async (id: string) => {
    setIsLoading(true);
    const data = await deleteSession(id);
    setSessions(data);
    setIsLoading(false);
  }, []);

  const seedDemoData = useCallback(async () => {
    setIsLoading(true);
    await saveSessions(demoSessions);
    setSessions(demoSessions);
    setIsLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      sessions,
      analytics,
      isLoading,
      refresh,
      saveSession: saveSessionHandler,
      removeSession: removeSessionHandler,
      seedDemoData,
    }),
    [analytics, isLoading, refresh, removeSessionHandler, seedDemoData, saveSessionHandler, sessions],
  );

  return <SleepDataContext.Provider value={value}>{children}</SleepDataContext.Provider>;
}

export function useSleepData() {
  const value = useContext(SleepDataContext);
  if (!value) {
    throw new Error('useSleepData must be used within SleepDataProvider');
  }
  return value;
}
