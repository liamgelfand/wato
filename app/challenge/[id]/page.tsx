import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface PageProps {
  params: { id: string }
}

const CATEGORY_COLORS: Record<string, string> = {
  FITNESS: 'bg-green-100 text-green-800',
  SKILL: 'bg-blue-100 text-blue-800',
  CREATIVITY: 'bg-purple-100 text-purple-800',
  ADVENTURE: 'bg-orange-100 text-orange-800',
  FUNNY: 'bg-pink-100 text-pink-800',
}

async function attemptChallenge(challengeId: string, userId: string) {
  'use server'
  
  const attempt = await prisma.attempt.create({
    data: {
      userId,
      challengeId,
      status: 'DRAFT',
    },
  })
  
  redirect(`/attempt/${attempt.id}`)
}

export default async function ChallengePage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: params.id },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
      attempts: {
        where: { status: 'APPROVED' },
        include: {
          user: {
            select: {
              username: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!challenge || challenge.status === 'HIDDEN') {
    notFound()
  }

  const creatorInitials = challenge.creator.name
    ? challenge.creator.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : challenge.creator.username.substring(0, 2).toUpperCase()

  const attemptAction = attemptChallenge.bind(null, challenge.id, (session.user as any).id)

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{challenge.title}</CardTitle>
              <p className="text-muted-foreground">{challenge.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge className={CATEGORY_COLORS[challenge.category]}>
              {challenge.category.toLowerCase()}
            </Badge>
            <Badge variant="secondary">
              {'⭐'.repeat(challenge.difficulty)} {challenge.difficulty}/5
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {challenge.points} points
            </Badge>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={challenge.creator.avatarUrl || undefined} />
                <AvatarFallback>{creatorInitials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{challenge.creator.name || challenge.creator.username}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created {formatDistanceToNow(new Date(challenge.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <form action={attemptAction}>
              <Button size="lg" type="submit">
                Attempt Challenge
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Completions</CardTitle>
        </CardHeader>
        <CardContent>
          {challenge.attempts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Be the first to complete this challenge!
            </p>
          ) : (
            <div className="space-y-4">
              {challenge.attempts.map((attempt) => {
                const userInitials = attempt.user.name
                  ? attempt.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  : attempt.user.username.substring(0, 2).toUpperCase()
                  
                return (
                  <div key={attempt.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={attempt.user.avatarUrl || undefined} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{attempt.user.name || attempt.user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          Completed {formatDistanceToNow(new Date(attempt.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/attempt/${attempt.id}`}>View</Link>
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
