import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { useTheme } from '../../hooks/use-theme'
import { radius, typography } from '../../constants/theme'

type InputProps = TextInputProps & {
  label: string
}

export function Input({ label, style, ...props }: InputProps) {
  const { colors } = useTheme()
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card },
          style,
        ]}
        {...props}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginBottom: 14 },
  label: { ...typography.label },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
})
