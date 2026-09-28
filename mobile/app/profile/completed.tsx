import { useCallback, useEffect, useState } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { ChallengeCard, type ChallengeItem } from '../../components/ui/challenge-card'
import { Screen } from '../../components/ui/screen'
import { AuthLoading, useAuthToken } from '../../hooks/use-auth-token'
import { useTheme } from '../../hooks/use-theme'
import { fetchMyProfile } from '../../lib/api'
import { formatRelativeTime, formatTimestamp } from '../../lib/format-time'
import { type AppColors, spacing, typography } from '../../constants/theme'

type CompletedItem = {
  attemptId: string
  completedAt: string
  pointsEarned: number
  challenge: ChallengeItem
}

export default function CompletedChallengesScreen() {
  const { token, loading: authLoading } = useAuthToken()
  const { colors } = useTheme()
  const [items, setItems] = useState<CompletedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (accessToken: string) => {
    const data = await fetchMyProfile(accessToken)
    setItems(data.completed ?? [])
  }, [])

  useEffect(() => {
    if (!token) return
    load(token).catch(() => {}).finally(() => setLoading(false))
  }, [token, load])

  if (authLoading || loading) return <AuthLoading />

  const styles = makeStyles(colors)

  return (
    <Screen padded={false}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={styles.title}>Completed</Text>
        <View style={styles.back} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.attemptId}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              if (!token) return
              setRefreshing(true)
              try { await load(token) } finally { setRefreshing(false) }
            }}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No completions yet</Text>
            <Text style={styles.empty}>Finish a challenge and upload your proof.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <ChallengeCard challenge={item.challenge} />
            <View style={styles.footer}>
              <Text style={styles.completedAt}>
                {formatTimestamp(item.completedAt)} · {formatRelativeTime(item.completedAt)}
              </Text>
            </View>
          </View>
        )}
      />
    </Screen>
  )
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    title: { flex: 1, textAlign: 'center', ...typography.label, color: colors.foreground },
    list: { padding: spacing.md, flexGrow: 1 },
    row: { marginBottom: spacing.xs },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: -4,
      marginBottom: spacing.sm,
      marginHorizontal: spacing.xs,
    },
    completedAt: { ...typography.caption, color: colors.mutedForeground, flex: 1 },
    emptyWrap: { alignItems: 'center', paddingTop: 56, paddingHorizontal: spacing.md },
    emptyTitle: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 20,
      color: colors.foreground,
      marginBottom: spacing.sm,
    },
    empty: { ...typography.caption, color: colors.mutedForeground, textAlign: 'center' },
  })
}
