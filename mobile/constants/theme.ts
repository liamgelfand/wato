export const fonts = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semiBold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  extraBold: 'DMSans_800ExtraBold',
}

export const lightColors = {
  background: '#f7f5f2',
  foreground: '#1a1714',
  card: '#ffffff',
  cardElevated: '#fffdfb',
  muted: '#f0ebe4',
  mutedForeground: '#6b6560',
  border: '#e0d9d0',
  borderStrong: '#c8bfb4',
  primary: '#c45c26',
  primaryDark: '#a34b1f',
  primaryForeground: '#fffaf5',
  primaryLight: '#fde8db',
  accent: '#e8c468',
  accentForeground: '#7a5f00',
  success: '#2d6a4f',
  successBg: '#d8f3dc',
  warning: '#92400e',
  warningBg: '#fef3c7',
  destructive: '#b91c1c',
  destructiveBg: '#fee2e2',
  overlay: 'rgba(0,0,0,0.55)',
  overlayLight: 'rgba(0,0,0,0.25)',
  shimmerBase: '#ede8e2',
  shimmerHighlight: '#f8f5f1',
  tabBar: 'rgba(247,245,242,0.88)',
  headerBlur: 'rgba(247,245,242,0.85)',
}

export const darkColors = {
  background: '#111010',
  foreground: '#f2eeea',
  card: '#1e1c1a',
  cardElevated: '#252220',
  muted: '#252220',
  mutedForeground: '#8c857e',
  border: '#2e2b28',
  borderStrong: '#3d3935',
  primary: '#d4703a',
  primaryDark: '#c45c26',
  primaryForeground: '#fff5ee',
  primaryLight: '#3a1e0d',
  accent: '#e8c468',
  accentForeground: '#f5e0a0',
  success: '#4ade80',
  successBg: '#0a2818',
  warning: '#fbbf24',
  warningBg: '#1c1505',
  destructive: '#f87171',
  destructiveBg: '#2a0808',
  overlay: 'rgba(0,0,0,0.7)',
  overlayLight: 'rgba(0,0,0,0.4)',
  shimmerBase: '#252220',
  shimmerHighlight: '#2e2b28',
  tabBar: 'rgba(17,16,16,0.88)',
  headerBlur: 'rgba(17,16,16,0.85)',
}

// Re-export lightColors as `colors` for backward compat (static styles)
export const colors = lightColors

export type AppColors = typeof lightColors

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
}

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.6,
    fontFamily: fonts.extraBold,
    lineHeight: 34,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    fontFamily: fonts.bold,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: fonts.regular,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
    fontFamily: fonts.medium,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    fontFamily: fonts.semiBold,
  },
  overline: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    fontFamily: fonts.bold,
  },
}

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
}
