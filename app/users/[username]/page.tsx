import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserBadges } from '@/lib/badges'
import { getUserStreak } from '@/lib/streaks'
import { isFollowing, followUser, unfollowUser } from '@/lib/follows'
import { areFriends } from '@/lib/friends'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShareButton } from '@/components/share/share-button'
import { profileUrl } from '@/lib/deep-links'

interface PageProps {
  params: Promise<{ username: string }>
}

async function toggleFollow(followingId: string, shouldFollow: boolean) {
  'use server'
  const session = await auth()
  if (!session?.user) return
  if (shouldFollow) {
    await followUser(session.user.id, followingId)
  } else {
    await unfollowUser(session.user.id, followingId)
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { username } = await params
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      isPrivate: true,
      totalPoints: true,
    },
  })

  if (!user) notFound()
  if (user.isPrivate && user.id !== session.user.id) {
    notFound()
  }

  const isSelf = user.id === session.user.id
  const [badges, streak, following, friends] = await Promise.all([
    getUserBadges(user.id),
    getUserStreak(user.id),
    isFollowing(session.user.id, user.id),
    areFriends(session.user.id, user.id),
  ])

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : user.username.substring(0, 2).toUpperCase()

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="text-lg font-semibold text-primary mt-1">{user.totalPoints} points</p>
              </div>
            </div>
            <ShareButton title={`${user.name || user.username} on Wato`} url={profileUrl(user.username)} />
          </div>
        </CardHeader>
        <CardContent>
          {streak && streak.currentStreak > 0 && (
            <Badge variant="secondary" className="mb-3">
              🔥 {streak.currentStreak}-day streak
            </Badge>
          )}
          {!isSelf && !user.isPrivate && (
            <form action={toggleFollow.bind(null, user.id, !following)}>
              <Button type="submit" variant={following ? 'outline' : 'default'}>
                {following ? 'Unfollow' : 'Follow'}
              </Button>
            </form>
          )}
          {!isSelf && friends && (
            <p className="text-sm text-muted-foreground mt-2">You&apos;re friends</p>
          )}
          {isSelf && (
            <Button asChild variant="outline">
              <Link href="/profile">Edit profile</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
