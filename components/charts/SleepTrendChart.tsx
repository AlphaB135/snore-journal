import { View } from 'react-native';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryLegend,
  VictoryLine,
  VictoryTheme,
} from 'victory-native';

import { ThemedText } from '@/components/themed-text';
import { AggregatedPoint } from '@/types/sleep';

type SleepTrendChartProps = {
  data: AggregatedPoint[];
  height?: number;
};

export function SleepTrendChart({ data, height = 260 }: SleepTrendChartProps) {
  if (!data.length) {
    return <ThemedText style={{ opacity: 0.7 }}>ยังไม่มีข้อมูลเพียงพอสำหรับสร้างกราฟ</ThemedText>;
  }

  const qualitySeries = data.map((point) => ({ x: point.label, y: point.averageQuality }));
  const snoreSeries = data.map((point) => ({ x: point.label, y: point.snoreMinutes }));

  return (
    <View accessibilityRole="image" accessibilityLabel="กราฟคุณภาพการนอน">
      <VictoryChart
        height={height}
        padding={{ top: 24, bottom: 60, left: 60, right: 30 }}
        theme={VictoryTheme.material}
        domainPadding={{ x: [20, 20], y: 20 }}>
        <VictoryLegend
          x={40}
          y={0}
          orientation="horizontal"
          gutter={16}
          data={[
            { name: 'คะแนนคุณภาพ', symbol: { fill: '#0a7ea4' } },
            { name: 'นาทีกรน', symbol: { fill: '#ffaf40' } },
          ]}
        />
        <VictoryAxis
          tickFormat={(tick) => tick}
          style={{
            tickLabels: { angle: -20, fontSize: 11, padding: 26 },
          }}
        />
        <VictoryAxis dependentAxis tickFormat={(tick) => `${tick}`} style={{ tickLabels: { fontSize: 11 } }} />
        <VictoryGroup>
          <VictoryLine
            data={qualitySeries}
            style={{ data: { stroke: '#0a7ea4', strokeWidth: 3 } }}
            interpolation="monotoneX"
          />
          <VictoryBar
            data={snoreSeries}
            barWidth={18}
            style={{ data: { fill: '#ffaf40', opacity: 0.7 } }}
            y={(datum) => datum.y}
          />
        </VictoryGroup>
      </VictoryChart>
    </View>
  );
}
