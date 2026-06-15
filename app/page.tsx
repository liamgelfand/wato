import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ChallengeCard } from '@/components/challenge/challenge-card'
import { CategoryFilter } from '@/components/challenge/category-filter'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

function FilterSkeleton() {
  return <Skeleton className="h-10 w-[200px]" />
}

export default async function HomePage({ searchParams }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const params = await searchParams
  const category = params.category || 'ALL'

  const challenges = await prisma.challenge.findMany({
    where: {
      status: 'ACTIVE',
      ...(category !== 'ALL' && { category: category as 'FITNESS' | 'SKILL' | 'CREATIVITY' | 'ADVENTURE' | 'FUNNY' }),
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
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
        <Suspense fallback={<FilterSkeleton />}>
          <CategoryFilter currentCategory={category} />
        </Suspense>
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
