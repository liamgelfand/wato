import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getUserTeams } from '@/lib/teams'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateTeamForm } from '@/components/teams/create-team-form'
import { Users } from 'lucide-react'

export default async function TeamsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const memberships = await getUserTeams(session.user.id)

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Teams
        </h1>
        <p className="text-muted-foreground">
          Create or join a group and compete on team leaderboards
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create a team</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTeamForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your teams</CardTitle>
        </CardHeader>
        <CardContent>
          {memberships.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              You haven&apos;t joined any teams yet.
            </p>
          ) : (
            <div className="space-y-3">
              {memberships.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-semibold">{m.team.name}</p>
                    <p className="text-sm text-muted-foreground">/{m.team.slug}</p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/teams/${m.team.slug}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
