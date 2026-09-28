import type { ComponentProps } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { Platform, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { useTheme } from '../../hooks/use-theme'

type IoniconName = ComponentProps<typeof Ionicons>['name']

function tabIcon(outline: IoniconName, filled: IoniconName) {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? filled : outline} size={size} color={color} />
  )
}

function TabBarBackground() {
  const { colors, isDark } = useTheme()
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={90}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFillObject}
      />
    )
  }
  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.tabBar }]} />
  )
}

export default function TabLayout() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const bottomPad = Math.max(insets.bottom, 8)
  const tabBarHeight = 56 + bottomPad

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: tabBarHeight,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          backgroundColor: 'transparent',
          elevation: 0,
          paddingTop: 8,
          paddingBottom: bottomPad,
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'DMSans_600SemiBold',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Feed', tabBarIcon: tabIcon('home-outline', 'home') }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: tabIcon('search-outline', 'search') }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: tabIcon('chatbubble-outline', 'chatbubble') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person-outline', 'person') }} />
      <Tabs.Screen name="friends" options={{ href: null }} />
    </Tabs>
  )
}
