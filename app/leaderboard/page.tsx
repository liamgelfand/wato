import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getFriendIds } from '@/lib/friends'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, Medal, Users, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

type LeaderboardUser = {
  id: string
  username: string
  name: string | null
  avatarUrl: string | null
  totalPoints?: number
  weeklyPoints?: number
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
  return <span className="text-sm text-muted-foreground">{rank}</span>
}

function renderLeaderboard(
  users: LeaderboardUser[],
  userId: string,
  isWeekly = false,
  emptyMessage: string
) {
  return (
    <div className="space-y-2">
      {users.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
      ) : (
        users.map((user, index) => {
          const rank = index + 1
          const isCurrentUser = user.id === userId
          const initials = user.name
            ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
            : user.username.substring(0, 2).toUpperCase()
          const points = isWeekly ? user.weeklyPoints : user.totalPoints

          return (
            <div
              key={user.id}
              data-testid={isCurrentUser ? 'current-user-entry' : 'leaderboard-entry'}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border',
                isCurrentUser && 'bg-primary/5 border-primary/20'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 flex justify-center">{getRankIcon(rank)}</div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    {user.name || user.username}
                    {isCurrentUser && <Badge variant="outline">You</Badge>}
                  </p>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{points}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

async function getWeeklyLeaderboard(userIds: string[] | null, limit = 50) {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const weeklyPoints = await prisma.pointsLedger.groupBy({
    by: ['userId'],
    where: {
      ...(userIds ? { userId: { in: userIds } } : {}),
      createdAt: { gte: oneWeekAgo },
    },
    _sum: { points: true },
  })

  const sorted = weeklyPoints
    .map((row) => ({
      userId: row.userId,
      points: row._sum.points ?? 0,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)

  if (sorted.length === 0) return []

  const weeklyUsers = await prisma.user.findMany({
    where: { id: { in: sorted.map((w) => w.userId) } },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
    },
  })

  return sorted
    .map((row) => {
      const user = weeklyUsers.find((u) => u.id === row.userId)
      if (!user) return null
      return { ...user, weeklyPoints: row.points }
    })
    .filter((u): u is NonNullable<typeof u> => u !== null)
}

export default async function LeaderboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userId = session.user.id
  const friendIds = await getFriendIds(userId)
  const friendsUserIds = [userId, ...friendIds]

  const [friendsAllTime, publicAllTime, friendsWeekly, publicWeekly] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: friendsUserIds } },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        totalPoints: true,
      },
      orderBy: { totalPoints: 'desc' },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        totalPoints: true,
      },
      orderBy: { totalPoints: 'desc' },
      take: 50,
    }),
    getWeeklyLeaderboard(friendsUserIds),
    getWeeklyLeaderboard(null, 50),
  ])

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Compete with friends or see how you rank in the community
        </p>
      </div>

      <Tabs defaultValue="friends">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="public" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Public
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <Tabs defaultValue="alltime">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="alltime">All Time</TabsTrigger>
              <TabsTrigger value="weekly">This Week</TabsTrigger>
            </TabsList>

            <TabsContent value="alltime">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Friends — All Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderLeaderboard(
                    friendsAllTime,
                    userId,
                    false,
                    'Add friends to see how you stack up!'
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weekly">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Friends — This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderLeaderboard(
                    friendsWeekly,
                    userId,
                    true,
                    'No friend activity this week yet.'
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="public">
          <Tabs defaultValue="alltime">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="alltime">All Time</TabsTrigger>
              <TabsTrigger value="weekly">This Week</TabsTrigger>
            </TabsList>

            <TabsContent value="alltime">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Community — All Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderLeaderboard(
                    publicAllTime,
                    userId,
                    false,
                    'No rankings yet.'
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weekly">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Community — This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderLeaderboard(
                    publicWeekly,
                    userId,
                    true,
                    'No activity this week yet.'
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
