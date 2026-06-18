const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export async function mobileLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

export async function fetchFeed(accessToken: string, tab: 'challenges' | 'friends' = 'challenges') {
  const res = await fetch(`${API_URL}/api/feed?tab=${tab}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Feed failed')
  return res.json()
}

export async function fetchTrending(accessToken: string) {
  const res = await fetch(`${API_URL}/api/challenges/trending`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Trending failed')
  return res.json()
}

export async function registerPushToken(accessToken: string, token: string, platform: string) {
  await fetch(`${API_URL}/api/devices`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, platform }),
  })
}

export { API_URL }
