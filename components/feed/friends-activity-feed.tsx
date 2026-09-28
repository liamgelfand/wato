import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProofDisplay } from '@/components/attempt/proof-display'
import { PointsPill } from '@/components/ui/points-pill'

interface FriendsActivityFeedProps {
  attempts: Array<{
    id: string
    proofUrl: string | null
    proofType: string | null
    updatedAt: Date
    user: {
      username: string
      name: string | null
      avatarUrl: string | null
    }
    challenge: {
      id: string
      title: string
      points: number
    }
  }>
  emptyTitle?: string
  emptyDescription?: string
}

function formatActivityTime(date: Date): string {
  const relative = formatDistanceToNow(date, { addSuffix: true })
  const absolute = format(date, 'MMM d, h:mm a')
  return `${absolute} · ${relative}`
}

export function FriendsActivityFeed({
  attempts,
  emptyTitle = 'No activity yet',
  emptyDescription = 'When friends complete challenges, their proof posts will show up here.',
}: FriendsActivityFeedProps) {
  if (attempts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">{emptyTitle}</p>
        <p className="text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {attempts.map((attempt) => {
        const initials = attempt.user.name
          ? attempt.user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
          : attempt.user.username.substring(0, 2).toUpperCase()
        const completedAt = new Date(attempt.updatedAt)

        return (
          <Card key={attempt.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={attempt.user.avatarUrl || undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {attempt.user.name || attempt.user.username}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    completed {attempt.challenge.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatActivityTime(completedAt)}
                  </p>
                </div>
                <PointsPill points={attempt.challenge.points} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {attempt.proofUrl && (
                <div className="rounded-lg overflow-hidden bg-muted">
                  <ProofDisplay
                    proofUrl={attempt.proofUrl}
                    proofType={attempt.proofType}
                    className="w-full max-h-[480px] object-contain"
                  />
                </div>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/attempt/${attempt.id}`}>View attempt</Link>
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
