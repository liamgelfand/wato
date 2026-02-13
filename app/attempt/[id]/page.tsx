import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProofUploader } from '@/components/attempt/proof-uploader'
import { Trophy } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: { id: string }
}

export default async function AttemptPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const attempt = await prisma.attempt.findUnique({
    where: { id: params.id },
    include: {
      challenge: {
        include: {
          creator: {
            select: {
              username: true,
              name: true,
            },
          },
        },
      },
      verificationVotes: {
        include: {
          voter: {
            select: {
              username: true,
              name: true,
            },
          },
        },
      },
    },
  })

  if (!attempt) {
    notFound()
  }

  // Check if user owns this attempt
  if (attempt.userId !== (session.user as any).id) {
    // Allow viewing if attempt is approved
    if (attempt.status !== 'APPROVED') {
      redirect('/')
    }
  }

  const isOwner = attempt.userId === (session.user as any).id

  return (
    <div className="container mx-auto max-w-3xl p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={
              attempt.status === 'APPROVED' ? 'default' :
              attempt.status === 'PENDING' ? 'secondary' :
              attempt.status === 'REJECTED' ? 'destructive' : 'outline'
            }>
              {attempt.status}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {attempt.challenge.points} points
            </Badge>
          </div>
          <CardTitle>{attempt.challenge.title}</CardTitle>
          <CardDescription>{attempt.challenge.description}</CardDescription>
        </CardHeader>
      </Card>

      {attempt.status === 'DRAFT' && isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Proof</CardTitle>
            <CardDescription>
              Upload a photo or video showing you completing this challenge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProofUploader
              attemptId={attempt.id}
              onUploadSuccess={() => window.location.reload()}
            />
          </CardContent>
        </Card>
      )}

      {attempt.status === 'PENDING' && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Verification</CardTitle>
            <CardDescription>
              Your attempt is waiting for verification from friends
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attempt.proofUrl && (
              <div className="mb-4">
                {attempt.proofType?.startsWith('video/') ? (
                  <video src={attempt.proofUrl} controls className="w-full rounded-lg" />
                ) : (
                  <img src={attempt.proofUrl} alt="Proof" className="w-full rounded-lg" />
                )}
              </div>
            )}

            <div className="space-y-2">
              <p className="font-medium">Verification Votes:</p>
              {attempt.verificationVotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No votes yet</p>
              ) : (
                <ul className="space-y-1">
                  {attempt.verificationVotes.map((vote) => (
                    <li key={vote.id} className="text-sm">
                      <Badge variant={vote.vote === 'VERIFY' ? 'default' : 'destructive'}>
                        {vote.vote}
                      </Badge>{' '}
                      by {vote.voter.name || vote.voter.username}
                      {vote.reason && `: ${vote.reason}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!isOwner && (
              <div className="mt-6">
                <Button asChild className="w-full">
                  <Link href={`/attempt/${attempt.id}/verify`}>
                    Vote on this Attempt
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {attempt.status === 'APPROVED' && (
        <Card>
          <CardHeader>
            <CardTitle>✅ Challenge Completed!</CardTitle>
            <CardDescription>
              This attempt has been verified and approved
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attempt.proofUrl && (
              <div className="mb-4">
                {attempt.proofType?.startsWith('video/') ? (
                  <video src={attempt.proofUrl} controls className="w-full rounded-lg" />
                ) : (
                  <img src={attempt.proofUrl} alt="Proof" className="w-full rounded-lg" />
                )}
              </div>
            )}
            <p className="text-lg font-semibold text-green-600">
              +{attempt.challenge.points} points earned! 🎉
            </p>
          </CardContent>
        </Card>
      )}

      {attempt.status === 'REJECTED' && isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>❌ Attempt Rejected</CardTitle>
            <CardDescription>
              This attempt did not meet the challenge requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attempt.proofUrl && (
              <div className="mb-4">
                {attempt.proofType?.startsWith('video/') ? (
                  <video src={attempt.proofUrl} controls className="w-full rounded-lg" />
                ) : (
                  <img src={attempt.proofUrl} alt="Proof" className="w-full rounded-lg" />
                )}
              </div>
            )}

            <div className="space-y-2 mb-4">
              <p className="font-medium">Reasons:</p>
              {attempt.verificationVotes
                .filter(v => v.vote === 'REJECT')
                .map((vote) => (
                  <p key={vote.id} className="text-sm text-muted-foreground">
                    • {vote.reason || 'No reason provided'}
                  </p>
                ))}
            </div>

            <Button asChild variant="outline">
              <Link href={`/challenge/${attempt.challengeId}`}>
                Try Again
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
