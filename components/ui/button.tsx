import { Pressable, StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function Button({ label, onPress, disabled }: ButtonProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: disabled ? `${palette.tint}33` : palette.tint,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      disabled={disabled}>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  label: {
    color: '#fff',
    fontWeight: '600',
  },
});
