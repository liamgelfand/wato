'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Trophy, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const { status } = useSession()
  const pathname = usePathname()

  if (status !== 'authenticated') {
    return null
  }

  const navItems = [
    { href: '/', label: 'Feed', icon: Home },
    { href: '/create', label: 'Create', icon: PlusCircle },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/friends', label: 'Friends', icon: Users },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-white">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-3 px-4 min-w-[60px]',
                isActive ? 'text-blue-600' : 'text-gray-600'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
