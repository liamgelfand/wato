import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ActivityCard, type ActivityItem } from '../../components/feed/activity-card'
import { ChallengeCard, type ChallengeItem } from '../../components/ui/challenge-card'
import { SkeletonList } from '../../components/ui/skeleton'
import { AuthLoading, useAuthToken } from '../../hooks/use-auth-token'
import { useTheme } from '../../hooks/use-theme'
import { fetchExplore, fetchTrending } from '../../lib/api'
import { radius, spacing, typography } from '../../constants/theme'

type ExploreSection =
  | { key: string; type: 'header'; title: string; subtitle?: string }
  | { key: string; type: 'activity'; item: ActivityItem }
  | { key: string; type: 'challenge'; item: ChallengeItem }

function toChallengeItem(c: {
  id: string
  title: string
  description: string
  category: string
  points: number
  difficulty: number
  creator: { username: string; name: string | null; avatarUrl?: string | null }
}): ChallengeItem {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    points: c.points,
    difficulty: c.difficulty,
    creator: c.creator,
  }
}

export default function ExploreTab() {
  const { token, loading: authLoading } = useAuthToken()
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [recommendations, setRecommendations] = useState<ChallengeItem[]>([])
  const [searchResults, setSearchResults] = useState<ChallengeItem[]>([])
  const [query, setQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (accessToken: string, q?: string) => {
    setError(null)
    try {
      const data = await fetchExplore(accessToken, q)
      setActivity(data.activity ?? [])
      setRecommendations((data.recommendations ?? []).map(toChallengeItem))
      setSearchResults((data.search ?? []).map(toChallengeItem))
      setQuery(data.query ?? q ?? '')
    } catch (exploreErr) {
      const trending = await fetchTrending(accessToken)
      setActivity([])
      setRecommendations((trending.challenges ?? []).map(toChallengeItem))
      setSearchResults([])
      setQuery(q ?? '')
      const msg = exploreErr instanceof Error ? exploreErr.message : ''
      if (msg.includes('404') || msg.includes('API endpoint missing')) {
        setError('Explore API outdated — run make docker-up on your PC, then pull to refresh.')
      } else {
        throw exploreErr
      }
    }
  }, [])

  useEffect(() => {
    if (!token) return
    load(token)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load explore'))
      .finally(() => setLoading(false))
  }, [token, load])

  useEffect(() => {
    if (!token) return
    const timer = setTimeout(() => {
      load(token, searchInput).catch(() => {})
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, token, load])

  const onRefresh = async () => {
    if (!token) return
    setRefreshing(true)
    try {
      await load(token, searchInput)
    } finally {
      setRefreshing(false)
    }
  }

  const sections = useMemo(() => {
    const rows: ExploreSection[] = []

    if (query.length >= 2) {
      rows.push({
        key: 'search-header',
        type: 'header',
        title: 'Search results',
        subtitle: `Matches for “${query}”`,
      })
      for (const item of searchResults) {
        rows.push({ key: `search-${item.id}`, type: 'challenge', item })
      }
      if (searchResults.length === 0) {
        rows.push({
          key: 'search-empty',
          type: 'header',
          title: 'No challenges found',
          subtitle: 'Try a different search term',
        })
      }
    }

    rows.push({
      key: 'activity-header',
      type: 'header',
      title: 'Discover completions',
      subtitle: 'From people outside your friend list',
    })
    for (const item of activity) {
      rows.push({ key: `activity-${item.id}`, type: 'activity', item })
    }
    if (activity.length === 0) {
      rows.push({
        key: 'activity-empty',
        type: 'header',
        title: 'No completions to discover yet',
        subtitle: 'Friend activity appears on Feed; new users show up here',
      })
    }

    rows.push({
      key: 'rec-header',
      type: 'header',
      title: 'Challenges you might like',
      subtitle: 'Trending and matched to your interests',
    })
    for (const item of recommendations) {
      rows.push({ key: `rec-${item.id}`, type: 'challenge', item })
    }
    if (recommendations.length === 0) {
      rows.push({
        key: 'rec-empty',
        type: 'header',
        title: 'No recommendations yet',
        subtitle: 'Complete a challenge or rebuild the API server',
      })
    }

    return rows
  }, [activity, recommendations, searchResults, query])

  if (authLoading) return <AuthLoading />

  const tabBarBottom = insets.bottom + 56 + 8
  const HEADER_INNER = 120 // title + search bar
  const headerHeight = insets.top + HEADER_INNER

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Sticky blur header */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={75} tint={isDark ? 'dark' : 'light'} style={[styles.header, { paddingTop: insets.top + 6 }]}>
          <HeaderContent
            colors={colors}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
        </BlurView>
      ) : (
        <View style={[styles.header, { paddingTop: insets.top + 6, backgroundColor: colors.headerBlur }]}>
          <HeaderContent
            colors={colors}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
        </View>
      )}

      {error ? (
        <Text style={[styles.error, { color: colors.destructive, marginTop: headerHeight }]}>{error}</Text>
      ) : null}

      <FlatList
        data={loading ? [] : sections}
        keyExtractor={(item) => item.key}
        contentContainerStyle={[styles.list, { paddingTop: headerHeight, paddingBottom: tabBarBottom + 24 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            progressViewOffset={headerHeight}
          />
        }
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={loading ? <View style={{ paddingTop: 8 }}><SkeletonList count={3} /></View> : null}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{item.title}</Text>
                {item.subtitle ? (
                  <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
                ) : null}
              </View>
            )
          }
          if (item.type === 'activity') {
            return <ActivityCard item={item.item} />
          }
          return <ChallengeCard challenge={item.item} />
        }}
      />
    </View>
  )
}

type HeaderContentProps = {
  colors: ReturnType<typeof useTheme>['colors']
  searchInput: string
  setSearchInput: (v: string) => void
}

function HeaderContent({ colors, searchInput, setSearchInput }: HeaderContentProps) {
  return (
    <View style={styles.headerContent}>
      <Text style={[styles.headerTitle, { color: colors.foreground }]}>Explore</Text>
      <View style={[styles.searchField, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Search challenges"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground }]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        {searchInput.length > 0 ? (
          <Pressable onPress={() => setSearchInput('')} hitSlop={8} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
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
    paddingBottom: 12,
  },
  headerContent: {},
  headerTitle: {
    ...typography.title,
    fontSize: 28,
    lineHeight: 34,
    marginBottom: spacing.sm,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    ...typography.body,
    fontSize: 16,
    lineHeight: Platform.OS === 'ios' ? 20 : 22,
    paddingVertical: 0,
    margin: 0,
    ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' } : {}),
  },
  clearBtn: { height: 44, justifyContent: 'center', alignItems: 'center' },
  error: {
    ...typography.caption,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  list: { paddingHorizontal: spacing.md, flexGrow: 1 },
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 18,
  },
  sectionSubtitle: {
    ...typography.caption,
    marginTop: 4,
  },
})
