import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { colors, radius, typography } from '../../constants/theme'

type InputProps = TextInputProps & {
  label: string
}

export function Input({ label, style, ...props }: InputProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    marginBottom: 14,
  },
  label: {
    ...typography.label,
    color: colors.foreground,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.card,
  },
})
