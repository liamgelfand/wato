'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface MessageFriendButtonProps {
  friendId: string
  friendName: string
}

export function MessageFriendButton({ friendId, friendName }: MessageFriendButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/messages/create-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start conversation')
      }

      router.push(`/messages/${data.threadId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start conversation')
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      aria-label={`Message ${friendName}`}
    >
      <MessageSquare className="h-4 w-4" />
      {loading ? 'Opening...' : 'Message'}
    </Button>
  )
}
