export const colors = {
  background: '#f7f5f2',
  foreground: '#2c2825',
  card: '#ffffff',
  muted: '#f0ebe4',
  mutedForeground: '#6b6560',
  border: '#e0d9d0',
  primary: '#c45c26',
  primaryForeground: '#fffaf5',
  accent: '#e8c468',
  destructive: '#b91c1c',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
}

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
}

export const typography = {
  title: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  heading: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  label: { fontSize: 14, fontWeight: '600' as const },
}
