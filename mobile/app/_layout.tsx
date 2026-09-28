import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { View, ActivityIndicator } from 'react-native'
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
} from '@expo-google-fonts/dm-sans'
import { DeviceFrame } from '../components/device-frame'
import { ThemeProvider, useTheme } from '../hooks/use-theme'
import { useOTAUpdates } from '../hooks/use-ota-updates'
import { colors as fallbackColors } from '../constants/theme'

function AppShell() {
  const { colors, isDark } = useTheme()
  useOTAUpdates()

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background, flex: 1 },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="challenge/[id]" />
        <Stack.Screen name="attempt/[id]" />
        <Stack.Screen name="messages/[threadId]" />
        <Stack.Screen name="messages/new" />
        <Stack.Screen name="profile/completed" />
        <Stack.Screen name="profile/created" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/settings" />
        <Stack.Screen name="profile/notifications" />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_800ExtraBold,
  })

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: fallbackColors.background }}>
        <ActivityIndicator color={fallbackColors.primary} />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DeviceFrame>
          <AppShell />
        </DeviceFrame>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
