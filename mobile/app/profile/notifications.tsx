import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '../../components/ui/screen'
import { AuthLoading, useAuthToken } from '../../hooks/use-auth-token'
import { useTheme } from '../../hooks/use-theme'
import { fetchNotifications, markAllNotificationsRead } from '../../lib/api'
import { formatRelativeTime } from '../../lib/format-time'
import { radius, spacing, typography, shadows } from '../../constants/theme'

type Notification = {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  createdAt: string
  referenceType?: string
  referenceId?: string
}

const TYPE_META: Record<string, { name: string; color: string; bg: string }> = {
  ATTEMPT_APPROVED: { name: 'checkmark-circle', color: '#2d6a4f', bg: '#d8f3dc' },
  ATTEMPT_REJECTED: { name: 'close-circle', color: '#b91c1c', bg: '#fee2e2' },
  CHALLENGE_APPROVED: { name: 'trophy', color: '#c45c26', bg: '#fde8db' },
  CHALLENGE_REJECTED: { name: 'ban', color: '#b91c1c', bg: '#fee2e2' },
  CHALLENGE_REVIEW_REQUEST: { name: 'shield-checkmark-outline', color: '#92400e', bg: '#fef3c7' },
  FRIEND_REQUEST: { name: 'person-add', color: '#1d4ed8', bg: '#dbeafe' },
  FRIEND_ACCEPTED: { name: 'people', color: '#1d4ed8', bg: '#dbeafe' },
  COMMENT: { name: 'chatbubble', color: '#6b6560', bg: '#f0ebe4' },
  UPVOTE: { name: 'heart', color: '#be185d', bg: '#fce7f3' },
}

const DEFAULT_META = { name: 'notifications', color: '#6b6560', bg: '#f0ebe4' }

function NotifIcon({ type }: { type: string }) {
  const icon = TYPE_META[type] ?? DEFAULT_META
  return (
    <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
      <Ionicons name={icon.name as never} size={20} color={icon.color} />
    </View>
  )
}

export default function NotificationsScreen() {
  const { token, loading: authLoading } = useAuthToken()
  const { colors } = useTheme()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [cursor, setCursor] = useState<string | undefined>()
  const [hasMore, setHasMore] = useState(false)
  const markedRead = useRef(false)

  const load = useCallback(async (accessToken: string, reset = true) => {
    const result = await fetchNotifications(accessToken, reset ? undefined : cursor)
    if (reset) {
      setNotifications(result.notifications)
    } else {
      setNotifications((prev) => [...prev, ...result.notifications])
    }
    setCursor(result.nextCursor)
    setHasMore(!!result.nextCursor)
  }, [cursor])

  useEffect(() => {
    if (!token) return
    load(token, true).catch(() => {}).finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (!token || markedRead.current) return
    markedRead.current = true
    markAllNotificationsRead(token).catch(() => {})
  }, [token])

  const onRefresh = async () => {
    if (!token) return
    setRefreshing(true)
    try { await load(token, true) } finally { setRefreshing(false) }
  }

  const onLoadMore = () => {
    if (!token || !hasMore) return
    load(token, false).catch(() => {})
  }

  const onPress = (n: Notification) => {
    const ref = n.referenceType?.toUpperCase()
    if (!n.referenceId) return
    if (ref === 'ATTEMPT') router.push(`/attempt/${n.referenceId}`)
    else if (ref === 'CHALLENGE') router.push(`/challenge/${n.referenceId}`)
    else if (ref === 'MESSAGE') router.push(`/messages/${n.referenceId}`)
    else if (ref === 'FRIENDSHIP' || ref === 'USER') router.push('/profile/friends' as never)
  }

  if (authLoading || loading) return <AuthLoading />

  return (
    <Screen padded={false}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
        <View style={styles.back} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Ionicons name="notifications-outline" size={40} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All caught up</Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              When someone reacts to your challenges or approves your attempts, it'll show up here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPress(item)}
            style={({ pressed }) => [
              styles.item,
              { backgroundColor: colors.card, borderColor: colors.border },
              !item.read && { borderColor: `${colors.primary}50`, backgroundColor: colors.primaryLight },
              pressed && styles.pressed,
            ]}
          >
            <NotifIcon type={item.type} />
            <View style={styles.content}>
              <Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text>
              <Text style={[styles.itemBody, { color: colors.mutedForeground }]} numberOfLines={2}>{item.body}</Text>
              <Text style={[styles.itemTime, { color: colors.mutedForeground }]}>{formatRelativeTime(item.createdAt)}</Text>
            </View>
            {!item.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
          </Pressable>
        )}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', ...typography.label, fontSize: 16 },
  list: { padding: spacing.md, paddingBottom: spacing.xl, flexGrow: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  pressed: { opacity: 0.88 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1 },
  itemTitle: { ...typography.label, fontSize: 14 },
  itemBody: { ...typography.caption, marginTop: 2, lineHeight: 18 },
  itemTime: { ...typography.caption, marginTop: 4, fontSize: 12 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    flexShrink: 0,
  },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.xl },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: { ...typography.heading, fontSize: 20, marginBottom: spacing.sm },
  emptyBody: { ...typography.body, fontSize: 15, textAlign: 'center', lineHeight: 22 },
})
