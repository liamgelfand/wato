'use client'

import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

type FeedTab = 'challenges' | 'friends'

interface FeedTabsProps {
  initialTab: FeedTab
  category: string
  challengesPanel: React.ReactNode
  friendsPanel: React.ReactNode
}

function buildTabUrl(tab: FeedTab, category: string) {
  const params = new URLSearchParams()
  params.set('tab', tab)
  if (category !== 'ALL') params.set('category', category)
  return `/?${params.toString()}`
}

export function FeedTabs({
  initialTab,
  category,
  challengesPanel,
  friendsPanel,
}: FeedTabsProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>(initialTab)

  const switchTab = useCallback(
    (tab: FeedTab) => {
      if (tab === activeTab) return
      setActiveTab(tab)
      window.history.replaceState(null, '', buildTabUrl(tab, category))
    },
    [activeTab, category]
  )

  return (
    <>
      <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg w-fit">
        <button
          type="button"
          onClick={() => switchTab('challenges')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'challenges'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Challenges to Do
        </button>
        <button
          type="button"
          onClick={() => switchTab('friends')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'friends'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Friends Activity
        </button>
      </div>

      <div className={activeTab === 'challenges' ? undefined : 'hidden'}>
        {challengesPanel}
      </div>
      <div className={activeTab === 'friends' ? undefined : 'hidden'}>
        {friendsPanel}
      </div>
    </>
  )
}
