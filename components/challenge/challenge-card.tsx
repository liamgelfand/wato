import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Calendar } from 'lucide-react'
import { CATEGORY_COLORS, CATEGORY_LABELS, type ChallengeCategoryName } from '@/lib/categories'

interface ChallengeCardProps {
  challenge: {
    id: string
    title: string
    description: string
    category: string
    difficulty: number
    points: number
    createdAt: Date
    creator: {
      username: string
      name: string | null
      avatarUrl: string | null
    }
  }
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const creatorInitials = challenge.creator.name
    ? challenge.creator.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : challenge.creator.username.substring(0, 2).toUpperCase()

  const categoryKey = challenge.category as ChallengeCategoryName
  const categoryColor = CATEGORY_COLORS[categoryKey] || 'bg-muted text-muted-foreground'

  return (
    <Card data-testid="challenge-card" className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Link href={`/challenge/${challenge.id}`}>
              <h3 className="font-semibold text-lg hover:text-primary cursor-pointer transition-colors">
                {challenge.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              {challenge.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge className={categoryColor}>
            {CATEGORY_LABELS[categoryKey] || challenge.category.toLowerCase()}
          </Badge>
          <Badge variant="secondary">
            {'★'.repeat(challenge.difficulty)}
            <span className="ml-1">{challenge.difficulty}/5</span>
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {challenge.points} pts
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={challenge.creator.avatarUrl || undefined} />
            <AvatarFallback className="text-xs">{creatorInitials}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {challenge.creator.username}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(new Date(challenge.createdAt), { addSuffix: true })}
          </span>
        </div>
        <Button size="sm" asChild>
          <Link href={`/challenge/${challenge.id}`}>Attempt</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ChallengeCard
