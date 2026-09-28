import { Platform, Pressable, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WatoLogo } from '../ui/wato-logo'
import { useTheme } from '../../hooks/use-theme'
import { spacing } from '../../constants/theme'

type FeedBrandHeaderProps = {
  onCreate?: () => void
}

export function FeedBrandHeader({ onCreate }: FeedBrandHeaderProps) {
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()

  const headerContent = (
    <View style={[styles.row, { paddingTop: insets.top + 6 }]}>
      <View style={styles.brand}>
        <WatoLogo />
      </View>
      <View style={styles.actions}>
        {onCreate ? (
          <Pressable
            onPress={onCreate}
            style={[styles.iconBtn, { backgroundColor: `${colors.foreground}10` }]}
            accessibilityRole="button"
            accessibilityLabel="Create challenge"
          >
            <Ionicons name="add" size={24} color={colors.foreground} />
          </Pressable>
        ) : null}
      </View>
    </View>
  )

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={75}
        tint={isDark ? 'dark' : 'light'}
        style={styles.header}
      >
        {headerContent}
      </BlurView>
    )
  }

  return (
    <View style={[styles.header, { backgroundColor: colors.headerBlur }]}>
      {headerContent}
    </View>
  )
}

const HEADER_HEIGHT = 52

export { HEADER_HEIGHT }

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: spacing.md,
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flex: 1 },
  actions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
})
