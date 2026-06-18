import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing } from '../../constants/theme'

type ScreenProps = {
  children: ReactNode
  scroll?: boolean
  style?: ViewStyle
  padded?: boolean
}

export function Screen({ children, scroll = false, style, padded = true }: ScreenProps) {
  const content = (
    <View style={[styles.inner, padded && styles.padded, style]}>{children}</View>
  )

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
  },
})
