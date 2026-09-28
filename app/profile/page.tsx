import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserStreak } from '@/lib/streaks'
import { DeleteAccountButton } from '@/components/profile/delete-account-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PrivacyToggle } from '@/components/profile/privacy-toggle'
import { PointsPill } from '@/components/ui/points-pill'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatarUrl: true,
      isPrivate: true,
      totalPoints: true,
      attempts: {
        where: { status: 'APPROVED' },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: { challenge: true },
      },
      challenges: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!user) {
    redirect('/login')
  }

  const streak = await getUserStreak(user.id)

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : user.username.substring(0, 2).toUpperCase()

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{user.totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{user.attempts.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{user.challenges.length}</div>
              <div className="text-sm text-muted-foreground">Created</div>
            </div>
          </div>
          {streak && streak.currentStreak > 0 && (
            <div className="mt-4 rounded-lg bg-orange-500/10 border border-orange-500/20 p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">🔥 {streak.currentStreak}</p>
              <p className="text-sm text-muted-foreground">day streak (best: {streak.longestStreak})</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Privacy & legal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PrivacyToggle isPrivate={user.isPrivate} />
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">Policies and safety information:</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/legal/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              <Link href="/legal/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              <Link href="/safety" className="text-primary hover:underline">
                Safety
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteAccountButton username={user.username} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Completions</CardTitle>
        </CardHeader>
        <CardContent>
          {user.attempts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No completed challenges yet. Start attempting challenges!
            </p>
          ) : (
            <div className="space-y-4">
              {user.attempts.map((attempt) => {
                const completedAt = new Date(attempt.updatedAt)
                return (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between gap-4 border-b pb-4 last:border-0"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold">{attempt.challenge.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(completedAt, 'MMM d, yyyy · h:mm a')} ·{' '}
                        {formatDistanceToNow(completedAt, { addSuffix: true })}
                      </p>
                    </div>
                    <PointsPill points={attempt.challenge.points} />
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
