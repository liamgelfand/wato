import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Updates from 'expo-updates'

/**
 * Checks for OTA updates on app launch (production only).
 * Shows an alert asking the user to restart when a new version is available.
 */
export function useOTAUpdates() {
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // Only run in production builds — skip in dev/Expo Go
    if (__DEV__ || !Updates.isEnabled) return

    async function checkForUpdate() {
      setIsChecking(true)
      try {
        const result = await Updates.checkForUpdateAsync()
        if (!result.isAvailable) return

        await Updates.fetchUpdateAsync()

        Alert.alert(
          'Update available',
          'A new version of Wato has been downloaded. Restart now to get the latest features.',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Restart',
              onPress: () => Updates.reloadAsync(),
            },
          ]
        )
      } catch {
        // Silently ignore — don't block the app if update check fails
      } finally {
        setIsChecking(false)
      }
    }

    checkForUpdate()
  }, [])

  return { isChecking }
}
