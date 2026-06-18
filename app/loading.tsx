import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Skeleton className="h-10 w-48 mb-2" />
      <Skeleton className="h-5 w-72 mb-6" />
      <Skeleton className="h-10 w-64 mb-6" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
