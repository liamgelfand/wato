import { StyleSheet, Text, View, type ViewStyle } from 'react-native'
import { colors, radius, typography } from '../../constants/theme'

type PointsPillProps = {
  points: number
  size?: 'sm' | 'md'
  variant?: 'default' | 'dark'
  style?: ViewStyle
}

export function PointsPill({ points, size = 'sm', variant = 'default', style }: PointsPillProps) {
  const isDark = variant === 'dark'
  return (
    <View
      style={[
        styles.pill,
        size === 'md' && styles.pillMd,
        isDark && styles.pillDark,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'md' && styles.textMd,
          isDark && styles.textDark,
        ]}
      >
        {points} pts
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: `${colors.primary}18`,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${colors.primary}40`,
  },
  pillMd: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillDark: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  text: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  textMd: {
    fontSize: 13,
  },
  textDark: {
    color: '#fff',
  },
})
