import { cn } from '@/lib/utils'

interface PointsPillProps {
  points: number
  className?: string
}

export function PointsPill({ points, className }: PointsPillProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-bold tracking-wide text-primary',
        className
      )}
    >
      {points} pts
    </span>
  )
}
