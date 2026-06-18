'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ShareButtonProps {
  title: string
  url: string
  text?: string
}

export function ShareButton({ title, url, text }: ShareButtonProps) {
  const handleShare = async () => {
    const shareData = {
      title,
      text: text ?? title,
      url,
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // user cancelled or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Could not share link')
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleShare}>
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  )
}
