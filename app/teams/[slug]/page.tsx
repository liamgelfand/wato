import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTeamLeaderboard } from '@/lib/teams'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JoinTeamButton } from '@/components/teams/join-team-button'
import { Trophy } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function TeamPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { slug } = await params
  const team = await prisma.team.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          user: { select: { id: true, username: true, name: true, avatarUrl: true } },
        },
      },
    },
  })

  if (!team) notFound()

  const isMember = team.members.some((m) => m.userId === session.user.id)
  const [allTime, weekly] = await Promise.all([
    getTeamLeaderboard(team.id, false),
    getTeamLeaderboard(team.id, true),
  ])

  const renderBoard = (
    users: Array<{
      id: string
      username: string
      name: string | null
      avatarUrl: string | null
      points: number
    }>
  ) => (
    <div className="space-y-2">
      {users.map((user, i) => {
        const initials = user.name
          ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
          : user.username.substring(0, 2).toUpperCase()
        return (
          <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-sm text-muted-foreground">{i + 1}</span>
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{user.name || user.username}</span>
            </div>
            <Badge variant="outline">{user.points} pts</Badge>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground">/{team.slug}</p>
          {team.description && <p className="mt-2">{team.description}</p>}
          <p className="text-sm text-muted-foreground mt-1">
            {team.members.length} member{team.members.length !== 1 ? 's' : ''}
          </p>
        </div>
        {!isMember && <JoinTeamButton slug={slug} />}
      </div>

      <Tabs defaultValue="alltime">
        <TabsList>
          <TabsTrigger value="alltime">All Time</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
        </TabsList>
        <TabsContent value="alltime">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Team leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>{renderBoard(allTime)}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly team leaderboard</CardTitle>
            </CardHeader>
            <CardContent>{renderBoard(weekly)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4">
        <Button variant="ghost" asChild>
          <Link href="/teams">← All teams</Link>
        </Button>
      </div>
    </div>
  )
}
