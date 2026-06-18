import { StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Button } from '../../components/ui/button'
import { Screen } from '../../components/ui/screen'
import { TabHeader } from '../../components/ui/tab-header'
import { AuthLoading, useAuthToken } from '../../hooks/use-auth-token'
import { deleteItemAsync } from '../../lib/storage'
import { API_URL } from '../../lib/api'
import { colors, radius, spacing, typography } from '../../constants/theme'

export default function ProfileTab() {
  const { loading } = useAuthToken()

  const signOut = async () => {
    await deleteItemAsync('accessToken')
    await deleteItemAsync('refreshToken')
    router.replace('/login')
  }

  if (loading) return <AuthLoading />

  return (
    <Screen>
      <TabHeader title="Profile" subtitle="Account & settings" />
      <View style={styles.card}>
        <Text style={styles.label}>API server</Text>
        <Text style={styles.value}>{API_URL}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.hint}>
          Create challenges, manage friends, and moderate on the full web app at the same API URL.
        </Text>
      </View>
      <Button label="Sign out" variant="secondary" onPress={signOut} style={styles.signOut} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  value: {
    ...typography.label,
    color: colors.foreground,
  },
  hint: {
    ...typography.caption,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  signOut: {
    marginTop: spacing.sm,
  },
})
