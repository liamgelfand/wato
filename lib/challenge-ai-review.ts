export interface AiReviewResult {
  safe: boolean
  note: string
  autoApprove: boolean
}

const UNSAFE_KEYWORDS = ['alcohol', 'drunk', 'weapon', 'gun', 'drug', 'suicide', 'self-harm']

const REVIEW_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS ?? 90_000)

function isAutoApproveEnabled(): boolean {
  return (
    process.env.OLLAMA_AUTO_APPROVE !== 'false' && process.env.OLLAMA_AUTO_APPROVE !== '0'
  )
}

export async function reviewChallengeWithAI(
  title: string,
  description: string
): Promise<AiReviewResult | null> {
  const ollamaUrl = process.env.OLLAMA_URL
  if (!ollamaUrl) return null

  const prompt = `You are a content moderator for a family-friendly challenge app.
Review this challenge and reply with JSON only: {"safe":true|false,"reason":"..."}
Title: ${title}
Description: ${description}`

  try {
    const response = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL ?? 'qwen2.5:7b',
        prompt,
        stream: false,
        format: 'json',
      }),
      signal: AbortSignal.timeout(REVIEW_TIMEOUT_MS),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error('Ollama review HTTP error:', response.status, body)
      return { safe: true, note: 'AI review unavailable', autoApprove: false }
    }

    const data = (await response.json()) as { response?: string }
    const parsed = JSON.parse(data.response ?? '{}') as { safe?: boolean; reason?: string }
    const safe = parsed.safe !== false
    const autoApprove = safe && isAutoApproveEnabled()
    return {
      safe,
      note: parsed.reason ?? (safe ? 'AI pre-check passed' : 'Flagged by AI'),
      autoApprove,
    }
  } catch (error) {
    const lower = `${title} ${description}`.toLowerCase()
    const flagged = UNSAFE_KEYWORDS.some((k) => lower.includes(k))
    const timedOut = error instanceof Error && error.name === 'TimeoutError'
    console.error('Ollama review failed:', error)

    return {
      safe: !flagged,
      note: flagged
        ? 'Keyword filter flagged content'
        : timedOut
          ? 'AI review timed out (model may still be loading). A moderator will review this challenge.'
          : 'AI review failed to connect. A moderator will review this challenge.',
      autoApprove: false,
    }
  }
}
