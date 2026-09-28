import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import {
  CATEGORY_LABELS,
  CATEGORY_STYLES,
  type ChallengeCategory,
} from '../../constants/categories'
import { hapticLight } from '../../lib/haptics'
import { useTheme } from '../../hooks/use-theme'
import { radius, spacing, typography, shadows } from '../../constants/theme'

export type ChallengeItem = {
  id: string
  title: string
  description: string
  category: ChallengeCategory
  points: number
  difficulty: number
  creator?: { username: string; name: string | null }
}

export function ChallengeCard({ challenge, onPress }: { challenge: ChallengeItem; onPress?: () => void }) {
  const { colors } = useTheme()
  const cat = CATEGORY_STYLES[challenge.category] ?? CATEGORY_STYLES.FUNNY

  const open = () => {
    hapticLight()
    if (onPress) { onPress(); return }
    router.push(`/challenge/${challenge.id}`)
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={open}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: cat.bg }]}>
          <Text style={[styles.badgeText, { color: cat.text }]}>
            {CATEGORY_LABELS[challenge.category] ?? challenge.category}
          </Text>
        </View>
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{challenge.title}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
        {challenge.description}
      </Text>
      {challenge.creator && (
        <Text style={[styles.creator, { color: colors.mutedForeground }]}>by @{challenge.creator.username}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  header: { marginBottom: spacing.sm },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  badgeText: { ...typography.caption, fontFamily: 'DMSans_600SemiBold' },
  title: { fontFamily: 'DMSans_700Bold', fontSize: 17, marginBottom: 4, letterSpacing: -0.2 },
  description: { ...typography.caption, lineHeight: 18 },
  creator: { ...typography.caption, marginTop: spacing.sm },
})
