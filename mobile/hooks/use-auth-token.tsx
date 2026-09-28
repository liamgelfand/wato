import { useEffect, useState } from 'react'
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native'
import { router } from 'expo-router'
import { getItemAsync } from '../lib/storage'
import { useTheme } from './use-theme'
import { typography } from '../constants/theme'

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getItemAsync('accessToken'),
      getItemAsync('onboardingDone'),
    ]).then(([t, onboarded]) => {
      if (!t) {
        if (!onboarded) {
          router.replace('/onboarding')
        } else {
          router.replace('/login')
        }
      } else {
        setToken(t)
      }
      setLoading(false)
    })
  }, [])

  return { token, loading }
}

export function AuthLoading() {
  const { colors } = useTheme()
  return (
    <View style={[styles.centered, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    ...typography.caption,
  },
})
