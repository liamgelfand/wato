'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface FriendSuggestionsProps {
  suggestions: Array<{
    id: string
    username: string
    name: string | null
    avatarUrl: string | null
    totalPoints: number
    mutualCount: number
  }>
}

export function FriendSuggestions({ suggestions: initial }: FriendSuggestionsProps) {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const sendRequest = async (username: string, id: string) => {
    setLoadingId(id)
    try {
      const res = await fetch('/api/friends/send-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed')
      }
      setSuggestions((s) => s.filter((x) => x.id !== id))
      toast.success('Friend request sent')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send request')
    } finally {
      setLoadingId(null)
    }
  }

  const follow = async (userId: string) => {
    setLoadingId(userId)
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed')
      }
      setSuggestions((s) => s.filter((x) => x.id !== userId))
      toast.success('Now following')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to follow')
    } finally {
      setLoadingId(null)
    }
  }

  if (suggestions.length === 0) return null

  return (
    <div className="space-y-3">
      {suggestions.map((s) => {
        const initials = s.name
          ? s.name.split(' ').map((n) => n[0]).join('').toUpperCase()
          : s.username.substring(0, 2).toUpperCase()
        return (
          <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={s.avatarUrl || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium truncate">{s.name || s.username}</p>
                <p className="text-sm text-muted-foreground">@{s.username}</p>
                {s.mutualCount > 0 && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {s.mutualCount} mutual
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                disabled={loadingId === s.id}
                onClick={() => sendRequest(s.username, s.id)}
              >
                Add
              </Button>
              <Button
                size="sm"
                disabled={loadingId === s.id}
                onClick={() => follow(s.id)}
              >
                Follow
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
