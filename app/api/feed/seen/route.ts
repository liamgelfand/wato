import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiUser } from '@/lib/api-auth'
import { markFeedSeen } from '@/lib/feed-activity'

const bodySchema = z.object({
  attemptIds: z.array(z.string().min(1)).min(1).max(50),
})

export async function POST(request: Request) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  await markFeedSeen(user.id, parsed.data.attemptIds)
  return NextResponse.json({ success: true })
}
