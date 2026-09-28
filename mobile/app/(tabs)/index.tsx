import { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ActivityCard, type ActivityItem } from '../../components/feed/activity-card'
import { FeedBrandHeader, HEADER_HEIGHT } from '../../components/feed/feed-brand-header'
import { SkeletonList } from '../../components/ui/skeleton'
import { AuthLoading, useAuthToken } from '../../hooks/use-auth-token'
import { useTheme } from '../../hooks/use-theme'
import { fetchFeedActivity, markFeedSeen } from '../../lib/api'
import { radius, spacing, typography } from '../../constants/theme'

export default function FeedTab() {
  const { token, loading: authLoading } = useAuthToken()
  const { colors } = useTheme()
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const markedSeen = useRef(new Set<string>())
  const insets = useSafeAreaInsets()

  // Height of the floating header (status bar + logo row)
  const headerHeight = insets.top + HEADER_HEIGHT + 10

  const load = useCallback(async (accessToken: string) => {
    setError(null)
    const items = await fetchFeedActivity(accessToken)
    setActivity(items)
  }, [])

  const onOpenActivity = useCallback(
    (item: ActivityItem) => {
      if (!token || markedSeen.current.has(item.id)) return
      markedSeen.current.add(item.id)
      markFeedSeen(token, [item.id]).catch(() => {})
    },
    [token]
  )

  useEffect(() => {
    if (!token) return
    load(token)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load feed'))
      .finally(() => setLoading(false))
  }, [token, load])

  const onRefresh = async () => {
    if (!token) return
    setRefreshing(true)
    try {
      await load(token)
    } finally {
      setRefreshing(false)
    }
  }

  if (authLoading) return <AuthLoading />

  const tabBarBottom = insets.bottom + 56 + 8

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Fixed blur header — rendered above the list */}
      <FeedBrandHeader onCreate={() => router.push('/create')} />

      {error ? (
        <Text style={[styles.error, { color: colors.destructive, marginTop: headerHeight }]}>
          {error}
        </Text>
      ) : null}

      <Animated.FlatList
        data={activity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingTop: headerHeight, paddingBottom: tabBarBottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            progressViewOffset={headerHeight}
          />
        }
        ListEmptyComponent={
          loading ? (
            <SkeletonList count={4} />
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyEmoji}>👋</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your feed is empty</Text>
              <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
                Add friends to see their challenge wins here.
              </Text>
              <Pressable
                onPress={() => router.push('/explore' as never)}
                style={({ pressed }) => [
                  styles.emptyBtn,
                  { backgroundColor: colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="search-outline" size={18} color={colors.primaryForeground} />
                <Text style={[styles.emptyBtnText, { color: colors.primaryForeground }]}>
                  Explore challenges
                </Text>
              </Pressable>
            </View>
          )
        }
        renderItem={({ item }) => <ActivityCard item={item} onOpen={onOpenActivity} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: {
    paddingHorizontal: spacing.md,
    flexGrow: 1,
  },
  error: {
    ...typography.caption,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  pressed: { opacity: 0.85 },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(128,128,128,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    marginBottom: spacing.sm,
    letterSpacing: -0.2,
  },
  emptyBody: {
    ...typography.body,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  emptyBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
  },
})
