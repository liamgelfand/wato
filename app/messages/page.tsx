import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default async function MessagesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userId = (session.user as any).id

  // Get all threads involving the user
  const threads = await prisma.messageThread.findMany({
    where: {
      OR: [
        { userAId: userId },
        { userBId: userId },
      ],
    },
    include: {
      userA: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
      userB: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
            },
          },
        },
      },
    },
    orderBy: {
      lastMessageAt: 'desc',
    },
  })

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          Messages
        </h1>
        <p className="text-muted-foreground">
          Chat with your friends
        </p>
      </div>

      <Card>
        {threads.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No messages yet. Start a conversation with a friend!
          </div>
        ) : (
          <div className="divide-y">
            {threads.map((thread) => {
              const otherUser = thread.userAId === userId ? thread.userB : thread.userA
              const lastMessage = thread.messages[0]
              const initials = otherUser.name
                ? otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
                : otherUser.username.substring(0, 2).toUpperCase()

              const unreadCount = thread.messages.filter(m => 
                !m.readAt && m.sender.id !== userId
              ).length

              return (
                <Link
                  key={thread.id}
                  href={`/messages/${thread.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={otherUser.avatarUrl || undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{otherUser.name || otherUser.username}</p>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage.body}
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <Badge className="ml-2">{unreadCount}</Badge>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
