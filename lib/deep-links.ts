export function appBaseUrl(): string {
  return process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
}

export function challengeUrl(challengeId: string): string {
  return `${appBaseUrl()}/challenge/${challengeId}`
}

export function attemptUrl(attemptId: string): string {
  return `${appBaseUrl()}/attempt/${attemptId}`
}

export function profileUrl(username: string): string {
  return `${appBaseUrl()}/users/${username}`
}

export function teamUrl(slug: string): string {
  return `${appBaseUrl()}/teams/${slug}`
}
