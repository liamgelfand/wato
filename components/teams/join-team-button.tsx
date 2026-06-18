'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function JoinTeamButton({ slug }: { slug: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const join = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/teams/${slug}`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed')
      }
      toast.success('Joined team')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
      setLoading(false)
    }
  }

  return (
    <Button onClick={join} disabled={loading}>
      {loading ? 'Joining...' : 'Join team'}
    </Button>
  )
}
