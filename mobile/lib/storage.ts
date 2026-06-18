import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const PREFIX = 'wato:'

function webStorage(): Storage | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage
}

export async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return webStorage()?.getItem(PREFIX + key) ?? null
  }
  return SecureStore.getItemAsync(key)
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    webStorage()?.setItem(PREFIX + key, value)
    return
  }
  await SecureStore.setItemAsync(key, value)
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    webStorage()?.removeItem(PREFIX + key)
    return
  }
  await SecureStore.deleteItemAsync(key)
}
