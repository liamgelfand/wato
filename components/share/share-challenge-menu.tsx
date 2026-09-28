'use client'

import { useState } from 'react'
import { Share2, Link2, MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { challengeUrl } from '@/lib/deep-links'

type Friend = { id: string; username: string; name: string | null }

interface ShareChallengeMenuProps {
  challengeId: string
  title: string
}

export function ShareChallengeMenu({ challengeId, title }: ShareChallengeMenuProps) {
  const url = challengeUrl(challengeId)
  const [friendDialogOpen, setFriendDialogOpen] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [sendingTo, setSendingTo] = useState<string | null>(null)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
    } catch {
      toast.error('Could not copy link')
    }
  }

  const externalShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: `Try this challenge: ${title}`, url })
        return
      } catch {
        // cancelled
      }
    }
    await copyLink()
  }

  const openFriendPicker = async () => {
    setFriendDialogOpen(true)
    if (friends.length > 0) return
    setLoadingFriends(true)
    try {
      const res = await fetch('/api/friends')
      if (!res.ok) throw new Error('Could not load friends')
      const data = (await res.json()) as { friends: Friend[] }
      setFriends(data.friends ?? [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load friends')
    } finally {
      setLoadingFriends(false)
    }
  }

  const sendToFriend = async (friendId: string) => {
    setSendingTo(friendId)
    try {
      const threadRes = await fetch('/api/messages/create-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      })
      if (!threadRes.ok) {
        const data = await threadRes.json()
        throw new Error(data.error ?? 'Could not open chat')
      }
      const { threadId } = (await threadRes.json()) as { threadId: string }
      const body = `Check out this challenge: ${title}\n${url}`
      const sendRes = await fetch(`/api/messages/${threadId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      if (!sendRes.ok) throw new Error('Could not send message')
      setFriendDialogOpen(false)
      toast.success('Sent to friend')
      window.location.href = `/messages/${threadId}`
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not send')
    } finally {
      setSendingTo(null)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={openFriendPicker}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Send to friend
          </DropdownMenuItem>
          <DropdownMenuItem onClick={externalShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share externally
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyLink}>
            <Link2 className="h-4 w-4 mr-2" />
            Copy link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={friendDialogOpen} onOpenChange={setFriendDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Send to a friend</DialogTitle>
          </DialogHeader>
          {loadingFriends ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : friends.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No friends yet. Follow people who follow you back to message them.
            </p>
          ) : (
            <ul className="overflow-y-auto -mx-2 flex-1">
              {friends.map((friend) => (
                <li key={friend.id}>
                  <button
                    type="button"
                    disabled={sendingTo === friend.id}
                    onClick={() => sendToFriend(friend.id)}
                    className="w-full text-left px-2 py-3 rounded-md hover:bg-muted disabled:opacity-50"
                  >
                    <p className="font-medium text-sm">{friend.name ?? friend.username}</p>
                    <p className="text-xs text-muted-foreground">@{friend.username}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
