import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { Appearance } from 'react-native'
import { lightColors, darkColors, type AppColors } from '../constants/theme'
import { getItemAsync, setItemAsync } from '../lib/storage'

type ThemeMode = 'system' | 'light' | 'dark'

type ThemeContextValue = {
  colors: AppColors
  isDark: boolean
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  mode: 'system',
  setMode: () => {},
})

const STORAGE_KEY = 'themeMode'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system')
  const [systemScheme, setSystemScheme] = useState(
    Appearance.getColorScheme() ?? 'light'
  )

  // Load stored preference on mount
  useEffect(() => {
    getItemAsync(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored)
        }
      })
      .catch(() => {})
  }, [])

  // Listen for system scheme changes
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme ?? 'light')
    })
    return () => sub.remove()
  }, [])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    setItemAsync(STORAGE_KEY, next).catch(() => {})
  }, [])

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark')

  const colors = isDark ? darkColors : lightColors

  return (
    <ThemeContext.Provider value={{ colors, isDark, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
