import { useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { setItemAsync } from '../lib/storage'
import { colors, radius, spacing, typography, shadows } from '../constants/theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const SLIDES = [
  {
    key: 'welcome',
    emoji: '⚡',
    title: 'Welcome to Wato',
    subtitle: 'The social platform where you dare, prove, and earn.',
    body: 'Complete real-world challenges, share your proof, and rack up points. Dare your friends. Own the leaderboard.',
    gradient: ['#c45c26', '#e8874f'] as [string, string],
  },
  {
    key: 'friends',
    emoji: '🔥',
    title: 'Compete with friends',
    subtitle: "It's more fun with people you know.",
    body: 'Add friends to see their wins on your feed. Challenge them, react to their proof, and climb the ranks together.',
    gradient: ['#1d4ed8', '#3b82f6'] as [string, string],
  },
  {
    key: 'challenges',
    emoji: '🏆',
    title: 'Create & conquer',
    subtitle: 'Anyone can create a challenge.',
    body: 'Dare the world — build a challenge, set the points, and watch friends (and strangers) try to beat it.',
    gradient: ['#2d6a4f', '#40916c'] as [string, string],
  },
]

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0)
  const translateX = useRef(new Animated.Value(0)).current

  const slide = SLIDES[index]

  const next = () => {
    if (index < SLIDES.length - 1) {
      Animated.spring(translateX, {
        toValue: -(index + 1) * SCREEN_WIDTH,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start()
      setIndex(index + 1)
    } else {
      finish()
    }
  }

  const finish = async () => {
    await setItemAsync('onboardingDone', 'true')
    router.replace('/login')
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={slide.gradient}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Skip */}
      {index < SLIDES.length - 1 && (
        <Pressable onPress={finish} style={styles.skip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      {/* Slides content */}
      <View style={styles.content}>
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{slide.emoji}</Text>
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>

      {/* CTA */}
      <Pressable
        onPress={next}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaText}>
          {index < SLIDES.length - 1 ? 'Continue' : 'Get started'}
        </Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </Pressable>

      <View style={styles.bottom} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  skip: {
    position: 'absolute',
    top: 56,
    right: spacing.lg,
  },
  skipText: {
    ...typography.label,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  emojiWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  emoji: { fontSize: 52 },
  title: {
    fontSize: 32,
    fontFamily: 'DMSans_800ExtraBold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'DMSans_600SemiBold',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#fff',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: radius.full,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '100%',
    marginBottom: spacing.sm,
  },
  ctaPressed: { opacity: 0.85 },
  ctaText: {
    fontSize: 17,
    fontFamily: 'DMSans_700Bold',
    color: '#fff',
    letterSpacing: -0.2,
  },
  bottom: { height: spacing.xl },
})
