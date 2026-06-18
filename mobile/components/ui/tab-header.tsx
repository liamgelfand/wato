import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '../../constants/theme'

type TabHeaderProps = {
  title: string
  subtitle?: string
}

export function TabHeader({ title, subtitle }: TabHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.title,
    fontSize: 26,
    color: colors.foreground,
  },
  subtitle: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginTop: 4,
  },
})
