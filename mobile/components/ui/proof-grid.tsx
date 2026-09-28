import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { resolveMediaUrl } from '../../lib/api'
import { colors, radius, spacing, typography } from '../../constants/theme'

type ProofGridItem = {
  id: string
  proofUrl: string | null
  proofType?: string | null
  challenge?: { title: string; points: number }
  completedAt?: string
}

export function ProofGrid({
  items,
  onPress,
}: {
  items: ProofGridItem[]
  onPress?: (item: ProofGridItem) => void
}) {
  const withMedia = items.filter((i) => i.proofUrl)
  const withoutMedia = items.filter((i) => !i.proofUrl)

  if (items.length === 0) return null

  return (
    <View>
      {withMedia.length > 0 && (
        <View style={styles.grid}>
          {withMedia.map((item) => {
            const uri = resolveMediaUrl(item.proofUrl)
            return (
              <Pressable
                key={item.id}
                onPress={() => (onPress ? onPress(item) : router.push(`/attempt/${item.id}`))}
                style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}
              >
                {uri ? (
                  <Image source={{ uri }} style={styles.cellImage} resizeMode="cover" />
                ) : (
                  <View style={styles.cellPlaceholder} />
                )}
                {item.challenge?.points ? (
                  <View style={styles.ptsBadge}>
                    <Text style={styles.ptsText}>{item.challenge.points}</Text>
                  </View>
                ) : null}
              </Pressable>
            )
          })}
        </View>
      )}

      {withoutMedia.length > 0 && (
        <View style={styles.listSection}>
          {withoutMedia.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => (onPress ? onPress(item) : router.push(`/attempt/${item.id}`))}
              style={({ pressed }) => [styles.listItem, pressed && styles.cellPressed]}
            >
              <View style={styles.listIcon}>
                <Text style={styles.listIconText}>✓</Text>
              </View>
              <View style={styles.listMeta}>
                <Text style={styles.listTitle} numberOfLines={1}>
                  {item.challenge?.title ?? 'Challenge'}
                </Text>
                {item.challenge?.points ? (
                  <Text style={styles.listPts}>+{item.challenge.points} pts</Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}

const CELL_GAP = 2
const NUM_COLS = 3

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CELL_GAP,
    marginBottom: CELL_GAP,
  },
  cell: {
    width: `${100 / NUM_COLS - 0.5}%`,
    aspectRatio: 1,
    backgroundColor: colors.muted,
    overflow: 'hidden',
    position: 'relative',
  },
  cellPressed: { opacity: 0.85 },
  cellImage: {
    width: '100%',
    height: '100%',
  },
  cellPlaceholder: {
    flex: 1,
    backgroundColor: colors.muted,
  },
  ptsBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ptsText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'DMSans_700Bold',
  },
  listSection: {
    gap: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listIconText: { fontSize: 16 },
  listMeta: { flex: 1 },
  listTitle: { ...typography.label, color: colors.foreground, fontSize: 14 },
  listPts: { ...typography.caption, color: colors.primary, marginTop: 2 },
})
