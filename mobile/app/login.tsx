import { useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Screen } from '../components/ui/screen'
import { setItemAsync } from '../lib/storage'
import { mobileLogin } from '../lib/api'
import { colors, spacing, typography } from '../constants/theme'

export default function LoginScreen() {
  const [email, setEmail] = useState('demo1@test.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const data = await mobileLogin(email.trim(), password)
      await setItemAsync('accessToken', data.accessToken)
      await setItemAsync('refreshToken', data.refreshToken)
      router.replace('/')
    } catch {
      Alert.alert('Login failed', 'Check your email and password, and that the API is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <View style={styles.logoMark}>
          <Text style={styles.logoIcon}>⚡</Text>
        </View>
        <Text style={styles.title}>Wato</Text>
        <Text style={styles.subtitle}>Complete challenges. Earn points. Prove it.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign in</Text>
        <Input
          label="Email"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
        />
        <Button label="Sign in" onPress={handleLogin} loading={loading} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoIcon: {
    fontSize: 28,
  },
  title: {
    ...typography.title,
    color: colors.foreground,
  },
  subtitle: {
    ...typography.caption,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardTitle: {
    ...typography.heading,
    fontSize: 20,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
})
