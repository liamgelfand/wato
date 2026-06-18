import { useEffect, useState } from 'react'
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native'
import { router } from 'expo-router'
import { getItemAsync } from '../lib/storage'
import { colors, typography } from '../constants/theme'

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getItemAsync('accessToken').then((t) => {
      if (!t) {
        router.replace('/login')
      } else {
        setToken(t)
      }
      setLoading(false)
    })
  }, [])

  return { token, loading }
}

export function AuthLoading() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Loading…</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.background,
  },
  text: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
})
