'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, User, LogOut, Trophy, MessageSquare, Users, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'

export function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (session?.user) {
      // Poll for unread notifications
      const fetchUnreadCount = async () => {
        try {
          const response = await fetch('/api/notifications/unread-count')
          if (response.ok) {
            const data = await response.json()
            setUnreadCount(data.count)
          }
        } catch (error) {
          console.error('Failed to fetch unread count:', error)
        }
      }

      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 10000) // Poll every 10s

      return () => clearInterval(interval)
    }
  }, [session])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : (session?.user as any)?.username?.substring(0, 2).toUpperCase() || 'U'

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-blue-600">DareScore</span>
          </Link>

          {status === 'authenticated' && (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/" className="text-sm hover:text-blue-600">
                Feed
              </Link>
              <Link href="/create" className="text-sm hover:text-blue-600">
                Create
              </Link>
              <Link href="/leaderboard" className="text-sm hover:text-blue-600">
                Leaderboard
              </Link>
              <Link href="/friends" className="text-sm hover:text-blue-600">
                Friends
              </Link>
              <Link href="/messages" className="text-sm hover:text-blue-600">
                Messages
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {status === 'authenticated' ? (
            <>
              <Link href="/notifications" className="relative">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={(session.user as any)?.avatarUrl} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{session.user?.name || (session.user as any)?.username}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/friends" className="cursor-pointer">
                      <Users className="mr-2 h-4 w-4" />
                      Friends
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  {(session.user as any)?.role === 'ADMIN' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
