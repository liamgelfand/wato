import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { useTheme } from '../../hooks/use-theme'
import { radius, spacing } from '../../constants/theme'

function Skeleton({ height = 16, width = '100%', style }: { height?: number; width?: number | string; style?: object }) {
  const { colors } = useTheme()
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [anim])

  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.shimmerBase, colors.shimmerHighlight],
  })

  return (
    <Animated.View
      style={[
        { height, width: width as never, borderRadius: radius.sm, backgroundColor: bgColor },
        style,
      ]}
    />
  )
}

function SkeletonCard() {
  const { colors } = useTheme()
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <Skeleton height={44} width={44} style={styles.avatar} />
        <View style={styles.lines}>
          <Skeleton height={14} width="55%" />
          <Skeleton height={12} width="80%" style={{ marginTop: 8 }} />
        </View>
      </View>
      <Skeleton height={14} width="70%" style={{ marginTop: 12 }} />
    </View>
  )
}

function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  )
}

export { Skeleton, SkeletonCard, SkeletonList }

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { borderRadius: 22 },
  lines: { flex: 1 },
})
