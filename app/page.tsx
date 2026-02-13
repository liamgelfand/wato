import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ChallengeCard } from '@/components/challenge/challenge-card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

interface PageProps {
  searchParams: { category?: string }
}

export default async function HomePage({ searchParams }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const category = searchParams.category || 'ALL'

  const challenges = await prisma.challenge.findMany({
    where: {
      status: 'ACTIVE',
      ...(category !== 'ALL' && { category: category as any }),
    },
    include: {
      creator: {
        select: {
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  })

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Challenge Feed</h1>
          <p className="text-muted-foreground">
            Discover and attempt challenges from the community
          </p>
        </div>
        <Button asChild>
          <Link href="/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Challenge
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <form action="/" method="get">
          <Select name="category" defaultValue={category}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="FITNESS">Fitness</SelectItem>
              <SelectItem value="SKILL">Skill</SelectItem>
              <SelectItem value="CREATIVITY">Creativity</SelectItem>
              <SelectItem value="ADVENTURE">Adventure</SelectItem>
              <SelectItem value="FUNNY">Funny</SelectItem>
            </SelectContent>
          </Select>
        </form>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No challenges found in this category.
          </p>
          <Button asChild>
            <Link href="/create">Create the first one!</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  )
}
