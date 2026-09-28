import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { resolveMediaUrl } from '../../lib/api'
import { formatRelativeTime } from '../../lib/format-time'
import { hapticLight } from '../../lib/haptics'
import { useTheme } from '../../hooks/use-theme'
import { radius, spacing, typography, shadows } from '../../constants/theme'

export type ActivityItem = {
  id: string
  proofUrl?: string | null
  updatedAt: string
  source?: 'friend' | 'public'
  user: { username: string; name: string | null; avatarUrl?: string | null }
  challenge: { id: string; title: string; points: number }
}

function displayName(user: ActivityItem['user']) {
  return user.name ?? user.username
}

function initials(user: ActivityItem['user']) {
  return displayName(user).split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

export function ActivityCard({ item, onOpen }: { item: ActivityItem; onOpen?: (item: ActivityItem) => void }) {
  const { colors } = useTheme()
  const proofUri = resolveMediaUrl(item.proofUrl ?? null)
  const avatarUri = resolveMediaUrl(item.user.avatarUrl ?? null)

  const open = () => {
    hapticLight()
    onOpen?.(item)
    router.push(`/attempt/${item.id}`)
  }

  if (proofUri) {
    return (
      <Pressable
        onPress={open}
        style={({ pressed }) => [styles.mediaCard, pressed && styles.pressed]}
      >
        <Image source={{ uri: proofUri }} style={styles.mediaFull} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.78)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay}>
          <View style={styles.avatarRow}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarSmall} />
            ) : (
              <View style={[styles.avatarSmall, styles.avatarSmallFallback]}>
                <Text style={styles.avatarSmallText}>{initials(item.user)}</Text>
              </View>
            )}
            <View style={styles.overlayMeta}>
              <Text style={styles.overlayName} numberOfLines={1}>{displayName(item.user)}</Text>
              <Text style={styles.overlayChallenge} numberOfLines={1}>{item.challenge.title}</Text>
            </View>
            <Text style={styles.overlayTime}>{formatRelativeTime(item.updatedAt)}</Text>
          </View>
        </View>
      </Pressable>
    )
  }

  return (
    <Pressable
      onPress={open}
      style={({ pressed }) => [
        styles.textCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>{initials(item.user)}</Text>
          </View>
        )}
        <View style={styles.meta}>
          <Text style={[styles.name, { color: colors.foreground }]}>{displayName(item.user)}</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            completed{' '}
            <Text style={[styles.challengeTitle, { color: colors.foreground }]}>{item.challenge.title}</Text>
          </Text>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>{formatRelativeTime(item.updatedAt)}</Text>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.92 },
  mediaCard: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    backgroundColor: '#000',
    ...shadows.sm,
  },
  mediaFull: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarSmallFallback: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: { ...typography.caption, color: '#fff', fontWeight: '700', fontSize: 12 },
  overlayMeta: { flex: 1 },
  overlayName: { color: '#fff', fontFamily: 'DMSans_700Bold', fontSize: 15, letterSpacing: -0.2 },
  overlayChallenge: { color: 'rgba(255,255,255,0.8)', fontFamily: 'DMSans_500Medium', fontSize: 13, marginTop: 2 },
  overlayTime: { color: 'rgba(255,255,255,0.65)', fontFamily: 'DMSans_400Regular', fontSize: 12 },
  textCard: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  avatarText: { ...typography.label, fontSize: 14 },
  meta: { flex: 1 },
  name: { fontFamily: 'DMSans_700Bold', fontSize: 15 },
  subtitle: { ...typography.caption, marginTop: 2 },
  challengeTitle: { fontFamily: 'DMSans_600SemiBold' },
  time: { ...typography.caption, marginTop: 4, fontSize: 12 },
})
