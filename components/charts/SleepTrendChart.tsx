import { Dimensions, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { AggregatedPoint } from '@/types/sleep';

type SleepTrendChartProps = {
  data: AggregatedPoint[];
};

const CHART_HEIGHT = 220;
const PADDING = 24;
const GRID_LINE_COUNT = 4;

type QualityPoint = { key: string; x: number; y: number };
type BarRect = { key: string; x: number; y: number; width: number; height: number };
type ChartLabel = { key: string; text: string };

type PreparedChart = {
  qualityPoints: QualityPoint[];
  barRects: BarRect[];
  labels: ChartLabel[];
  maxQuality: number;
  maxSnore: number;
};

export function SleepTrendChart({ data }: SleepTrendChartProps) {
  const windowWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(260, Math.min(windowWidth - 64, 420));

  const prepared = useMemo(() => prepareChartData(data, chartWidth), [chartWidth, data]);

  if (!prepared) {
    return <ThemedText style={styles.emptyLabel}>ยังไม่มีข้อมูลเพียงพอสำหรับสร้างกราฟ</ThemedText>;
  }

  const { qualityPoints, barRects, labels, maxQuality, maxSnore } = prepared;
  const polylinePoints = qualityPoints.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <View style={[styles.container, { width: chartWidth }]}>
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        <Line
          x1={PADDING}
          y1={CHART_HEIGHT - PADDING}
          x2={chartWidth - PADDING}
          y2={CHART_HEIGHT - PADDING}
          stroke="#CBD5E1"
          strokeWidth={1}
        />

        {Array.from({ length: GRID_LINE_COUNT }).map((_, index) => {
          const y = PADDING + ((CHART_HEIGHT - PADDING * 2) / GRID_LINE_COUNT) * index;
          return (
            <Line
              key={`grid-${index}`}
              x1={PADDING}
              y1={y}
              x2={chartWidth - PADDING}
              y2={y}
              stroke="#E2E8F0"
              strokeDasharray="4 6"
              strokeWidth={1}
            />
          );
        })}

        {barRects.map((rect) => (
          <Rect
            key={rect.key}
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            rx={4}
            fill="#ffaf40"
            opacity={0.7}
          />
        ))}

        <Polyline points={polylinePoints} fill="none" stroke="#0a7ea4" strokeWidth={3} />

        {qualityPoints.map((point) => (
          <Circle key={`dot-${point.key}`} cx={point.x} cy={point.y} r={4} fill="#0a7ea4" />
        ))}

        <SvgText x={PADDING} y={20} fill="#475569" fontSize="12" fontWeight="600">
          คะแนนคุณภาพ (สูงสุด {maxQuality})
        </SvgText>
        <SvgText x={PADDING} y={36} fill="#F97316" fontSize="12" fontWeight="600">
          นาทีกรน (สูงสุด {maxSnore})
        </SvgText>
      </Svg>

      <View style={styles.labelsRow}>
        {labels.map((label) => (
          <ThemedText key={label.key} style={styles.label}>
            {label.text}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

function prepareChartData(data: AggregatedPoint[], chartWidth: number): PreparedChart | null {
  if (!data.length) {
    return null;
  }

  const qualityMax = Math.max(100, ...data.map((item) => item.averageQuality));
  const snoreMax = Math.max(5, ...data.map((item) => item.snoreMinutes));
  const drawableWidth = chartWidth - PADDING * 2;
  const drawableHeight = CHART_HEIGHT - PADDING * 2;
  const barMaxHeight = drawableHeight * 0.6;
  const step = data.length > 1 ? drawableWidth / (data.length - 1) : 0;
  const barWidth = data.length > 1 ? Math.max(12, step * 0.3) : drawableWidth * 0.3;

  const qualityPoints: QualityPoint[] = data.map((item, index) => {
    const x = PADDING + index * step;
    const normalizedQuality = item.averageQuality / qualityMax;
    const y = PADDING + (1 - normalizedQuality) * drawableHeight;
    return { key: item.dateKey, x, y };
  });

  const barRects: BarRect[] = data.map((item, index) => {
    const x = PADDING + index * step - barWidth / 2;
    const normalizedSnore = item.snoreMinutes / snoreMax;
    const height = Math.max(4, normalizedSnore * barMaxHeight);
    const y = PADDING + drawableHeight - height;
    return { key: `${item.dateKey}-bar`, x, y, width: barWidth, height };
  });

  const labels: ChartLabel[] = data.map((item) => ({ key: `${item.dateKey}-label`, text: item.label }));

  return {
    qualityPoints,
    barRects,
    labels,
    maxQuality: Math.round(qualityMax),
    maxSnore: Number(snoreMax.toFixed(1)),
  };
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  label: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
  },
  emptyLabel: {
    opacity: 0.7,
  },
});
