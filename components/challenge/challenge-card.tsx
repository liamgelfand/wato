import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Calendar } from 'lucide-react'

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

const CATEGORY_COLORS: Record<string, string> = {
  FITNESS: 'bg-green-100 text-green-800',
  SKILL: 'bg-blue-100 text-blue-800',
  CREATIVITY: 'bg-purple-100 text-purple-800',
  ADVENTURE: 'bg-orange-100 text-orange-800',
  FUNNY: 'bg-pink-100 text-pink-800',
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const creatorInitials = challenge.creator.name
    ? challenge.creator.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : challenge.creator.username.substring(0, 2).toUpperCase()

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Link href={`/challenge/${challenge.id}`}>
              <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer">
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
          <Badge className={CATEGORY_COLORS[challenge.category] || 'bg-gray-100 text-gray-800'}>
            {challenge.category.toLowerCase()}
          </Badge>
          <Badge variant="secondary">
            {'⭐'.repeat(challenge.difficulty)} {challenge.difficulty}/5
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
          <Link href={`/challenge/${challenge.id}`}>
            Attempt
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
