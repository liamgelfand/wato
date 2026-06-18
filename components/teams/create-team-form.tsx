'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function CreateTeamForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast.success('Team created')
      router.push(`/teams/${data.team.slug}`)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="team-name">Team name</Label>
        <Input
          id="team-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={80}
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="team-desc">Description (optional)</Label>
        <Textarea
          id="team-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          disabled={loading}
        />
      </div>
      <Button type="submit" disabled={loading || !name.trim()}>
        {loading ? 'Creating...' : 'Create team'}
      </Button>
    </form>
  )
}
