import { useCallback, useEffect, useState } from 'react'
import {
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AuthLoading, useAuthToken } from '../../hooks/use-auth-token'
import { useTheme } from '../../hooks/use-theme'
import { fetchMyProfile, fetchUnreadNotificationCount, resolveMediaUrl } from '../../lib/api'
import { radius, spacing, typography, shadows } from '../../constants/theme'

type ProfileUser = {
  username: string
  name: string | null
  bio?: string | null
  avatarUrl?: string | null
  completedCount: number
  createdCount: number
  pendingCreatedCount?: number
  friendsCount?: number
  followersCount?: number
  followingCount?: number
  canModerate?: boolean
  currentStreak?: number
}

function StatCard({
  value,
  label,
  hint,
  onPress,
  colors,
}: {
  value: string | number
  label: string
  hint?: string
  onPress?: () => void
  colors: ReturnType<typeof useTheme>['colors']
}) {
  const inner = (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.foreground }]}>{label}</Text>
      {hint ? <Text style={[styles.statHint, { color: colors.mutedForeground }]}>{hint}</Text> : null}
    </View>
  )
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {inner}
      </Pressable>
    )
  }
  return inner
}

const PROFILE_HEADER_HEIGHT = 52

export default function ProfileTab() {
  const { token, loading: authLoading } = useAuthToken()
  const { colors, isDark } = useTheme()
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const insets = useSafeAreaInsets()

  const load = useCallback(async (accessToken: string) => {
    const [profileData, notifData] = await Promise.allSettled([
      fetchMyProfile(accessToken),
      fetchUnreadNotificationCount(accessToken),
    ])
    if (profileData.status === 'fulfilled') {
      const { user: u, streak } = profileData.value
      setUser({ ...u, currentStreak: streak?.currentStreak ?? 0 })
    }
    if (notifData.status === 'fulfilled') setUnreadCount(notifData.value.count)
  }, [])

  useEffect(() => {
    if (!token) return
    load(token).catch(() => {}).finally(() => setLoading(false))
  }, [token, load])

  useFocusEffect(
    useCallback(() => {
      if (!token) return
      load(token).catch(() => {})
    }, [token, load])
  )

  const onRefresh = async () => {
    if (!token) return
    setRefreshing(true)
    try { await load(token) } finally { setRefreshing(false) }
  }

  const signOut = async () => {
    const { deleteItemAsync } = await import('../../lib/storage')
    await deleteItemAsync('accessToken')
    await deleteItemAsync('refreshToken')
    router.replace('/login')
  }

  if (authLoading || loading) return <AuthLoading />

  const avatarUri = user ? resolveMediaUrl(user.avatarUrl) : null
  const streak = user?.currentStreak ?? 0
  const headerHeight = insets.top + PROFILE_HEADER_HEIGHT
  const tabBarBottom = insets.bottom + 56 + 8

  const headerContent = (
    <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
      <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
      <View style={styles.headerActions}>
        <Pressable onPress={() => router.push('/profile/notifications')} style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color={colors.foreground} />
          {unreadCount > 0 && (
            <View style={[styles.notifBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </Pressable>
        <Pressable onPress={() => router.push('/profile/settings')} style={styles.iconBtn}>
          <Ionicons name="settings-outline" size={22} color={colors.foreground} />
        </Pressable>
        <Pressable onPress={() => router.push('/profile/edit')} style={styles.iconBtn}>
          <Ionicons name="create-outline" size={22} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  )

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Sticky blur header */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={75} tint={isDark ? 'dark' : 'light'} style={styles.header}>
          {headerContent}
        </BlurView>
      ) : (
        <View style={[styles.header, { backgroundColor: colors.headerBlur }]}>
          {headerContent}
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: headerHeight, paddingBottom: tabBarBottom + 24 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            progressViewOffset={headerHeight}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {user && (
          <>
            <View style={styles.hero}>
              <View style={styles.avatarContainer}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={[styles.avatar, { borderColor: colors.border }]} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>
                      {(user.name ?? user.username).slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.heroMeta}>
                <Text style={[styles.name, { color: colors.foreground }]}>{user.name ?? user.username}</Text>
                <Text style={[styles.handle, { color: colors.mutedForeground }]}>@{user.username}</Text>
                {streak > 0 && (
                  <View style={[styles.streakBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                    <Text style={[styles.streakText, { color: colors.mutedForeground }]}>{streak} day streak</Text>
                  </View>
                )}
              </View>
            </View>

            {user.bio ? <Text style={[styles.bio, { color: colors.foreground }]}>{user.bio}</Text> : null}

            <View style={styles.statsGrid}>
              <StatCard value={user.completedCount} label="Completed" hint="Tap to see all" onPress={() => router.push('/profile/completed')} colors={colors} />
              <StatCard value={user.createdCount} label="Created" hint={(user.pendingCreatedCount ?? 0) > 0 ? `${user.pendingCreatedCount} in review` : undefined} onPress={() => router.push('/profile/created')} colors={colors} />
              <StatCard value={user.friendsCount ?? 0} label="Friends" onPress={() => router.push('/profile/friends')} colors={colors} />
              <StatCard value={user.followersCount ?? 0} label="Followers" onPress={() => router.push('/profile/followers')} colors={colors} />
              <StatCard value={user.followingCount ?? 0} label="Following" onPress={() => router.push('/profile/following')} colors={colors} />
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={() => router.push('/create')}
                style={({ pressed }) => [styles.actionBtn, { backgroundColor: colors.primary }, pressed && styles.pressed]}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primaryForeground} />
                <Text style={[styles.actionBtnText, { color: colors.primaryForeground }]}>New challenge</Text>
              </Pressable>
              {user.canModerate && (
                <Pressable
                  onPress={() => router.push('/profile/review')}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: `${colors.primary}40` },
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>Review queue</Text>
                </Pressable>
              )}
            </View>

            <Pressable
              onPress={signOut}
              style={({ pressed }) => [
                styles.signOut,
                { borderColor: colors.border, backgroundColor: colors.card },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="log-out-outline" size={18} color={colors.mutedForeground} />
              <Text style={[styles.signOutText, { color: colors.mutedForeground }]}>Sign out</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: spacing.md,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: 'DMSans_800ExtraBold',
    fontSize: 26,
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: 'row', gap: spacing.xs },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontFamily: 'DMSans_700Bold' },
  content: { paddingHorizontal: spacing.md },
  pressed: { opacity: 0.8 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 24,
  },
  heroMeta: { flex: 1 },
  name: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    letterSpacing: -0.3,
  },
  handle: { ...typography.caption, marginTop: 2 },
  streakBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  streakText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  bio: {
    ...typography.body,
    fontSize: 15,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    ...shadows.sm,
  },
  statValue: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    marginTop: 2,
  },
  statHint: { ...typography.caption, marginTop: 2, fontSize: 11 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: radius.lg,
  },
  actionBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14 },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  signOutText: { ...typography.label },
})
