import { createNotification } from '@/lib/notifications'

export async function notifyChallengeReviewResult(
  creatorId: string,
  challengeId: string,
  title: string,
  approved: boolean,
  note: string
): Promise<void> {
  await createNotification({
    userId: creatorId,
    type: approved ? 'CHALLENGE_APPROVED' : 'CHALLENGE_REJECTED',
    referenceType: 'CHALLENGE',
    referenceId: challengeId,
    title: approved ? 'Challenge approved' : 'Challenge not approved',
    body: approved
      ? `"${title}" is live — others can try it now.`
      : `"${title}" was not approved: ${note}`,
  })
}
