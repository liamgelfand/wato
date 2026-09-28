import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Screen } from '../../components/ui/screen'
import { AuthLoading, useAuthToken } from '../../hooks/use-auth-token'
import { useTheme } from '../../hooks/use-theme'
import { API_URL, deleteAccount, fetchMyProfile, updateMyProfile } from '../../lib/api'
import { radius, spacing, typography } from '../../constants/theme'

type ThemeMode = 'system' | 'light' | 'dark'

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
]

export default function SettingsScreen() {
  const { token, loading: authLoading } = useAuthToken()
  const { colors, mode, setMode } = useTheme()
  const [username, setUsername] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingPrivacy, setSavingPrivacy] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (accessToken: string) => {
    const data = await fetchMyProfile(accessToken)
    setUsername(data.user.username)
    setIsPrivate(Boolean(data.user.isPrivate))
  }, [])

  useEffect(() => {
    if (!token) return
    load(token).catch(() => {}).finally(() => setLoading(false))
  }, [token, load])

  const setPrivacy = async (nextPrivate: boolean) => {
    if (!token || savingPrivacy) return
    setSavingPrivacy(true)
    setError(null)
    try {
      await updateMyProfile(token, { isPrivate: nextPrivate })
      setIsPrivate(nextPrivate)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update privacy')
    } finally {
      setSavingPrivacy(false)
    }
  }

  const openLegal = (path: string) => {
    Linking.openURL(`${API_URL}${path}`).catch(() => setError('Could not open link'))
  }

  const onDelete = () => {
    if (!token) return
    if (deleteConfirm !== username) {
      setError('Username does not match')
      return
    }
    Alert.alert(
      'Delete account?',
      'This permanently removes your account and all data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true)
            setError(null)
            try {
              await deleteAccount(token, username)
              const { deleteItemAsync } = await import('../../lib/storage')
              await deleteItemAsync('accessToken')
              await deleteItemAsync('refreshToken')
              router.replace('/login')
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Could not delete account')
              setDeleting(false)
            }
          },
        },
      ]
    )
  }

  if (authLoading || loading) return <AuthLoading />

  return (
    <Screen padded={false}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}

        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = mode === opt.value
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setMode(opt.value)}
                  style={({ pressed }) => [
                    styles.themeBtn,
                    active && { backgroundColor: colors.primary, borderColor: colors.primary },
                    !active && { backgroundColor: colors.muted, borderColor: colors.border },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Ionicons
                    name={opt.icon as never}
                    size={18}
                    color={active ? colors.primaryForeground : colors.foreground}
                  />
                  <Text
                    style={[
                      styles.themeBtnText,
                      { color: active ? colors.primaryForeground : colors.foreground },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Account visibility */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Account visibility</Text>
        <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
          Private accounts only show your completions to friends.
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.privacyRow}>
            <Pressable
              onPress={() => setPrivacy(false)}
              disabled={savingPrivacy}
              style={[
                styles.privacyBtn,
                !isPrivate && { backgroundColor: colors.primary, borderColor: colors.primary },
                isPrivate && { backgroundColor: colors.muted, borderColor: colors.border },
              ]}
            >
              <Ionicons name="globe-outline" size={18} color={!isPrivate ? colors.primaryForeground : colors.foreground} />
              <Text style={[styles.privacyText, { color: !isPrivate ? colors.primaryForeground : colors.foreground }]}>
                Public
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPrivacy(true)}
              disabled={savingPrivacy}
              style={[
                styles.privacyBtn,
                isPrivate && { backgroundColor: colors.primary, borderColor: colors.primary },
                !isPrivate && { backgroundColor: colors.muted, borderColor: colors.border },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={18} color={isPrivate ? colors.primaryForeground : colors.foreground} />
              <Text style={[styles.privacyText, { color: isPrivate ? colors.primaryForeground : colors.foreground }]}>
                Private
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Legal */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Legal & safety</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: 'Privacy Policy', path: '/legal/privacy' },
            { label: 'Terms of Service', path: '/legal/terms' },
            { label: 'Safety', path: '/safety' },
          ].map((item, i, arr) => (
            <Pressable
              key={item.path}
              onPress={() => openLegal(item.path)}
              style={({ pressed }) => [
                styles.linkRow,
                i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.linkText, { color: colors.foreground }]}>{item.label}</Text>
              <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>

        {/* Delete account */}
        <Text style={[styles.sectionTitle, styles.dangerTitle, { color: colors.destructive }]}>
          Delete account
        </Text>
        <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
          Permanently remove your account. Type your username to confirm.
        </Text>
        <Input
          label="Confirm username"
          value={deleteConfirm}
          onChangeText={setDeleteConfirm}
          placeholder={username}
          autoCapitalize="none"
        />
        <Button
          label={deleting ? 'Deleting…' : 'Delete account'}
          variant="secondary"
          onPress={onDelete}
          disabled={deleting || deleteConfirm !== username}
          style={styles.deleteBtn}
        />
      </ScrollView>
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
  title: { flex: 1, textAlign: 'center', ...typography.label },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  error: { ...typography.caption, marginBottom: spacing.sm },
  sectionTitle: { ...typography.label, marginTop: spacing.lg, marginBottom: spacing.xs },
  dangerTitle: { marginTop: spacing.xl },
  sectionHint: { ...typography.caption, marginBottom: spacing.sm },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  themeRow: { flexDirection: 'row', padding: spacing.sm, gap: spacing.sm },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  themeBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13 },
  privacyRow: { flexDirection: 'row', padding: spacing.sm, gap: spacing.sm },
  privacyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  privacyText: { ...typography.caption, fontFamily: 'DMSans_600SemiBold' },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  linkText: { ...typography.body, fontSize: 15 },
  deleteBtn: { marginTop: spacing.sm },
})
