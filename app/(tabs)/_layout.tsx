import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ภาพรวม',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="waveform.path.ecg" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recorder"
        options={{
          title: 'บันทึก',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="mic.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'วิเคราะห์',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.doc.horizontal.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
