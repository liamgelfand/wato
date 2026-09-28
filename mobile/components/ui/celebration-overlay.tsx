import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { colors, typography } from '../../constants/theme'

type CelebrationProps = {
  points: number
  onDone: () => void
}

function Particle({ delay }: { delay: number }) {
  const y = useRef(new Animated.Value(0)).current
  const x = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(1)).current
  const rotate = useRef(new Animated.Value(0)).current

  const dx = (Math.random() - 0.5) * 180
  const dy = -(80 + Math.random() * 120)
  const color = [colors.primary, colors.accent, '#40916c', '#3b82f6', '#be185d'][
    Math.floor(Math.random() * 5)
  ]

  useEffect(() => {
    Animated.parallel([
      Animated.timing(y, { toValue: dy, duration: 700, delay, useNativeDriver: true }),
      Animated.timing(x, { toValue: dx, duration: 700, delay, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 700, delay: delay + 300, useNativeDriver: true }),
      Animated.timing(rotate, { toValue: 1, duration: 700, delay, useNativeDriver: true }),
    ]).start()
  }, [])

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          transform: [{ translateX: x }, { translateY: y }, { rotate: spin }],
          opacity,
        },
      ]}
    />
  )
}

export function CelebrationOverlay({ points, onDone }: CelebrationProps) {
  const scale = useRef(new Animated.Value(0.4)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 250 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.delay(1600),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onDone())
  }, [])

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <View style={styles.center}>
        {Array.from({ length: 18 }).map((_, i) => (
          <Particle key={i} delay={i * 30} />
        ))}
        <Animated.View style={[styles.badge, { transform: [{ scale }], opacity }]}>
          <Text style={styles.check}>✓</Text>
          <Text style={styles.label}>Approved!</Text>
          <Text style={styles.pts}>+{points} pts</Text>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  badge: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  check: { fontSize: 40, marginBottom: 4 },
  label: {
    ...typography.heading,
    color: colors.success,
    fontSize: 20,
  },
  pts: {
    ...typography.title,
    color: colors.primary,
    fontSize: 28,
    marginTop: 4,
  },
})
