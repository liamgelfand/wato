import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from 'react-native'
import { useTheme } from '../../hooks/use-theme'
import { radius, typography } from '../../constants/theme'

type ButtonProps = PressableProps & {
  label: string
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  style?: ViewStyle
}

export function Button({
  label,
  loading,
  variant = 'primary',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useTheme()
  const isDisabled = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && { backgroundColor: colors.primary },
        variant === 'secondary' && { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.primaryForeground : colors.primary} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'primary' && { color: colors.primaryForeground },
            variant === 'secondary' && { color: colors.foreground },
            variant === 'ghost' && { color: colors.primary },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.5 },
  label: { ...typography.label },
})
