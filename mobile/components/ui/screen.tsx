import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../hooks/use-theme'
import { spacing } from '../../constants/theme'

type ScreenProps = {
  children: ReactNode
  scroll?: boolean
  style?: ViewStyle
  padded?: boolean
}

export function Screen({ children, scroll = false, style, padded = true }: ScreenProps) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const inner = (
    <View
      style={[
        styles.inner,
        { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  )

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1 },
  padded: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  scrollContent: { flexGrow: 1 },
})
