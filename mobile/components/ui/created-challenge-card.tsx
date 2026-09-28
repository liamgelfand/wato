import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { CATEGORY_LABELS, CATEGORY_STYLES, type ChallengeCategory } from '../../constants/categories'
import { formatRelativeTime } from '../../lib/format-time'
import { useTheme } from '../../hooks/use-theme'
import { type AppColors, radius, spacing, typography } from '../../constants/theme'
import type { ChallengeItem } from './challenge-card'

export type CreatedChallengeItem = ChallengeItem & {
  status: 'ACTIVE' | 'PENDING_REVIEW' | 'REJECTED' | 'HIDDEN' | 'ARCHIVED'
  aiReviewNote?: string | null
  createdAt?: string
}

const STATUS_LABELS: Record<CreatedChallengeItem['status'], string> = {
  ACTIVE: 'Live',
  PENDING_REVIEW: 'In review',
  REJECTED: 'Rejected',
  HIDDEN: 'Hidden',
  ARCHIVED: 'Closed',
}

const STATUS_COLORS: Record<CreatedChallengeItem['status'], { bg: string; text: string }> = {
  ACTIVE: { bg: '#d8f3dc', text: '#2d6a4f' },
  PENDING_REVIEW: { bg: '#fef3c7', text: '#92400e' },
  REJECTED: { bg: '#fee2e2', text: '#b91c1c' },
  HIDDEN: { bg: '#f0ebe4', text: '#6b6560' },
  ARCHIVED: { bg: '#f0ebe4', text: '#6b6560' },
}

type CreatedChallengeCardProps = {
  challenge: CreatedChallengeItem
  onArchive?: (challengeId: string) => void
}

export function CreatedChallengeCard({ challenge, onArchive }: CreatedChallengeCardProps) {
  const { colors } = useTheme()
  const cat = CATEGORY_STYLES[challenge.category] ?? CATEGORY_STYLES.FUNNY
  const statusStyle = STATUS_COLORS[challenge.status] ?? STATUS_COLORS.PENDING_REVIEW
  const canArchive =
    onArchive && challenge.status !== 'ARCHIVED' && challenge.status !== 'PENDING_REVIEW'

  const confirmArchive = () => {
    Alert.alert(
      'Close challenge?',
      'No one can start new attempts. People who already completed it keep their history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close challenge',
          style: 'destructive',
          onPress: () => onArchive?.(challenge.id),
        },
      ]
    )
  }

  const styles = makeStyles(colors)

  return (
    <Pressable
      onPress={() => router.push(`/challenge/${challenge.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: cat.bg }]}>
          <Text style={[styles.badgeText, { color: cat.text }]}>
            {CATEGORY_LABELS[challenge.category as ChallengeCategory] ?? challenge.category}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {STATUS_LABELS[challenge.status]}
            </Text>
          </View>
          {canArchive ? (
            <Pressable onPress={confirmArchive} hitSlop={8} style={styles.archiveBtn}>
              <Ionicons name="trash-outline" size={18} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>
      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.meta}>
        difficulty {challenge.difficulty}/5
        {challenge.createdAt ? ` · ${formatRelativeTime(challenge.createdAt)}` : ''}
      </Text>
      {(challenge.status === 'PENDING_REVIEW' || challenge.status === 'REJECTED') && challenge.aiReviewNote && (
        <Text style={styles.note} numberOfLines={2}>{challenge.aiReviewNote}</Text>
      )}
    </Pressable>
  )
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    pressed: { opacity: 0.92 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
    badgeText: { ...typography.caption, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
    statusText: { ...typography.caption, fontWeight: '600' },
    archiveBtn: { padding: 4 },
    title: { ...typography.label, fontSize: 17, color: colors.foreground, marginBottom: 4 },
    meta: { ...typography.caption, color: colors.mutedForeground },
    note: { ...typography.caption, color: colors.mutedForeground, marginTop: spacing.sm },
  })
}
