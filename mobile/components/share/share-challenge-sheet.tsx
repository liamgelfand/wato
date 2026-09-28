import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthToken } from '../../hooks/use-auth-token'
import { useTheme } from '../../hooks/use-theme'
import { API_URL, fetchFriends, shareChallengeWithFriend } from '../../lib/api'
import { type AppColors, radius, spacing, typography } from '../../constants/theme'

type Friend = { id: string; username: string; name: string | null }

type ShareChallengeSheetProps = {
  visible: boolean
  challengeId: string
  title: string
  onClose: () => void
}

export function ShareChallengeSheet({
  visible,
  challengeId,
  title,
  onClose,
}: ShareChallengeSheetProps) {
  const { token } = useAuthToken()
  const { colors } = useTheme()
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadFriends = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchFriends(token)
      setFriends(data.friends ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load friends')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (visible) loadFriends()
  }, [visible, loadFriends])

  const shareExternal = async () => {
    const url = `${API_URL}/challenge/${challengeId}`
    try {
      await Share.share({ message: `Try this challenge: ${title}\n${url}`, title })
    } catch {
      // cancelled
    }
  }

  const sendToFriend = async (friendId: string) => {
    if (!token) return
    setSending(friendId)
    setError(null)
    try {
      const { threadId } = await shareChallengeWithFriend(token, friendId, challengeId, title)
      onClose()
      router.push(`/messages/${threadId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send')
    } finally {
      setSending(null)
    }
  }

  const styles = makeStyles(colors)

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Share challenge</Text>

        <Pressable onPress={shareExternal} style={styles.action}>
          <Ionicons name="share-outline" size={22} color={colors.foreground} />
          <Text style={styles.actionText}>Share externally</Text>
        </Pressable>

        <Text style={styles.section}>Send to a friend</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            style={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>No friends yet. Follow people who follow you back.</Text>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => sendToFriend(item.id)}
                disabled={sending === item.id}
                style={({ pressed }) => [styles.friendRow, pressed && styles.friendPressed]}
              >
                <View style={styles.friendMeta}>
                  <Text style={styles.friendName}>{item.name ?? item.username}</Text>
                  <Text style={styles.friendHandle}>@{item.username}</Text>
                </View>
                {sending === item.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="paper-plane-outline" size={20} color={colors.primary} />
                )}
              </Pressable>
            )}
          />
        )}

        <Pressable onPress={onClose} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  )
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
      minHeight: '50%',
      maxHeight: '80%',
    },
    handle: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginVertical: spacing.sm,
    },
    title: { ...typography.heading, fontSize: 18, color: colors.foreground, marginBottom: spacing.md },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    actionText: { ...typography.label, color: colors.foreground },
    section: {
      ...typography.caption,
      color: colors.mutedForeground,
      fontWeight: '600',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    list: { flex: 1 },
    friendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    friendPressed: { opacity: 0.85 },
    friendMeta: { flex: 1 },
    friendName: { ...typography.label, color: colors.foreground },
    friendHandle: { ...typography.caption, color: colors.mutedForeground },
    empty: { ...typography.caption, color: colors.mutedForeground, textAlign: 'center', paddingVertical: spacing.lg },
    error: { ...typography.caption, color: colors.destructive, marginBottom: spacing.sm },
    loader: { paddingVertical: spacing.lg },
    cancel: { marginTop: spacing.md, alignItems: 'center', paddingVertical: spacing.sm },
    cancelText: { ...typography.label, color: colors.mutedForeground },
  })
}
