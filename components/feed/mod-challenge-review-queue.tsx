import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ClipboardList } from 'lucide-react'

interface ModChallengeReviewQueueProps {
  challenges: Array<{
    id: string
    title: string
    category: string
    points: number
    creator: {
      username: string
      name: string | null
      avatarUrl: string | null
    }
  }>
}

export function ModChallengeReviewQueue({ challenges }: ModChallengeReviewQueueProps) {
  if (challenges.length === 0) return null

  return (
    <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-5 w-5 text-amber-600" />
          Challenges awaiting approval ({challenges.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map((challenge) => {
          const initials = challenge.creator.name
            ? challenge.creator.name.split(' ').map((n) => n[0]).join('').toUpperCase()
            : challenge.creator.username.substring(0, 2).toUpperCase()

          return (
            <div
              key={challenge.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-card border"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={challenge.creator.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {challenge.creator.name || challenge.creator.username}
                  </span>
                </div>
                <p className="font-semibold text-sm">{challenge.title}</p>
                <p className="text-xs text-muted-foreground">
                  {challenge.category} · {challenge.points} points
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/challenge/${challenge.id}`}>View</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/admin">Approve</Link>
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
