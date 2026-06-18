'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TagFriendsInputProps {
  onChange: (usernames: string) => void
}

export function TagFriendsInput({ onChange }: TagFriendsInputProps) {
  const [value, setValue] = useState('')

  return (
    <div className="space-y-2">
      <Label htmlFor="tag-friends">Tag friends (optional)</Label>
      <Input
        id="tag-friends"
        placeholder="@demo2, @demo3"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          onChange(e.target.value)
        }}
      />
      <p className="text-xs text-muted-foreground">
        Comma-separated usernames — they&apos;ll get notified when you post
      </p>
    </div>
  )
}
