import { useCallback, useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { ChallengeCard, type ChallengeItem } from '../../components/ui/challenge-card'
import { Screen } from '../../components/ui/screen'
import { TabHeader } from '../../components/ui/tab-header'
import { AuthLoading, useAuthToken } from '../../hooks/use-auth-token'
import { fetchFeed } from '../../lib/api'
import { colors, spacing, typography } from '../../constants/theme'

export default function ChallengesTab() {
  const { token, loading: authLoading } = useAuthToken()
  const [challenges, setChallenges] = useState<ChallengeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (accessToken: string) => {
    const data = await fetchFeed(accessToken, 'challenges')
    setChallenges(data.challenges ?? [])
  }, [])

  useEffect(() => {
    if (!token) return
    load(token)
      .catch(() => {})
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

  if (authLoading || loading) return <AuthLoading />

  return (
    <Screen padded={false}>
      <TabHeader title="Wato" subtitle="Challenges to do" />
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptyBody}>No open challenges right now.</Text>
          </View>
        }
        renderItem={({ item }) => <ChallengeCard challenge={item} />}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.heading,
    fontSize: 18,
    color: colors.foreground,
    marginBottom: 6,
  },
  emptyBody: {
    ...typography.caption,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
})
