'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { signOut } from 'next-auth/react'

interface DeleteAccountButtonProps {
  username: string
}

export function DeleteAccountButton({ username }: DeleteAccountButtonProps) {
  const router = useRouter()
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (confirm !== username) {
      toast.error('Username does not match')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: username }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete account')
      }
      await signOut({ redirect: false })
      toast.success('Account deleted')
      router.push('/register')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-destructive/30 p-4">
      <p className="text-sm text-muted-foreground">
        Permanently delete your account and all data. Type <strong>@{username}</strong> to confirm.
      </p>
      <div className="space-y-2">
        <Label htmlFor="delete-confirm">Username</Label>
        <Input
          id="delete-confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={username}
          disabled={loading}
        />
      </div>
      <Button
        variant="destructive"
        onClick={handleDelete}
        disabled={loading || confirm !== username}
      >
        {loading ? 'Deleting...' : 'Delete account'}
      </Button>
    </div>
  )
}
