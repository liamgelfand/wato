import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native'
import { colors, radius, typography } from '../../constants/theme'

type ButtonProps = PressableProps & {
  label: string
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({
  label,
  loading,
  variant = 'primary',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
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
            variant === 'primary' && styles.primaryLabel,
            variant === 'secondary' && styles.secondaryLabel,
            variant === 'ghost' && styles.ghostLabel,
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
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.label,
  },
  primaryLabel: {
    color: colors.primaryForeground,
  },
  secondaryLabel: {
    color: colors.foreground,
  },
  ghostLabel: {
    color: colors.primary,
  },
})
