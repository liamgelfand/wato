import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getTrendingChallenges } from '@/lib/trending'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShareButton } from '@/components/share/share-button'
import { Compass, Trophy, TrendingUp } from 'lucide-react'
import { CATEGORY_COLORS, CATEGORY_LABELS, type ChallengeCategoryName } from '@/lib/categories'
import { challengeUrl } from '@/lib/deep-links'

export default async function ExplorePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const trending = await getTrendingChallenges(24)

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Compass className="h-8 w-8 text-primary" />
          Explore
        </h1>
        <p className="text-muted-foreground">
          Trending challenges in the community this week
        </p>
      </div>

      <div className="space-y-4">
        {trending.map((challenge, index) => {
          const categoryKey = challenge.category as ChallengeCategoryName
          return (
            <Card key={challenge.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {index < 3 && (
                        <Badge variant="secondary" className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          #{index + 1}
                        </Badge>
                      )}
                      <Badge className={CATEGORY_COLORS[categoryKey]}>
                        {CATEGORY_LABELS[categoryKey]}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">
                      <Link href={`/challenge/${challenge.id}`} className="hover:underline">
                        {challenge.title}
                      </Link>
                    </CardTitle>
                  </div>
                  <ShareButton
                    title={challenge.title}
                    url={challengeUrl(challenge.id)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {challenge.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      {challenge.points} pts
                    </span>
                    <span>{challenge.completionCount} completions this week</span>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/challenge/${challenge.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
