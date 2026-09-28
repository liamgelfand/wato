import { useCallback, useEffect, useRef, useState } from 'react'

import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native'

import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'

import { Ionicons } from '@expo/vector-icons'

import { Button } from '../../components/ui/button'

import { Screen } from '../../components/ui/screen'

import { ProofUploader } from '../../components/media/proof-media'

import { CelebrationOverlay } from '../../components/ui/celebration-overlay'

import {

  CATEGORY_LABELS,

  CATEGORY_STYLES,

  type ChallengeCategory,

} from '../../constants/categories'

import { AuthLoading, useAuthToken } from '../../hooks/use-auth-token'

import { fetchChallenge, startChallengeAttempt } from '../../lib/api'
import { ShareChallengeSheet } from '../../components/share/share-challenge-sheet'
import { formatRelativeTime, formatTimestamp } from '../../lib/format-time'
import { hapticSuccess } from '../../lib/haptics'

import { radius, spacing, typography } from '../../constants/theme'
import { useTheme } from '../../hooks/use-theme'



const AI_REVIEW_IN_PROGRESS = 'AI review in progress…'



type AttemptStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'



type ChallengeDetail = {

  id: string

  title: string

  description: string

  category: ChallengeCategory

  points: number

  difficulty: number

  status: 'ACTIVE' | 'PENDING_REVIEW' | 'REJECTED' | 'ARCHIVED'

  aiReviewNote?: string | null

  prerequisiteMet: boolean

  draftAttemptId: string | null

  isCreator?: boolean

  myAttempt?: { id: string; status: AttemptStatus; updatedAt: string } | null

  creator: { username: string; name: string | null }

  prerequisiteChallenge?: { id: string; title: string } | null

}



function needsReviewPolling(challenge: ChallengeDetail | null): boolean {

  if (!challenge) return false

  if (challenge.myAttempt?.status === 'PENDING') return true

  if (challenge.status === 'PENDING_REVIEW') return true

  if (challenge.aiReviewNote === AI_REVIEW_IN_PROGRESS) return true

  return false

}



export default function ChallengeDetailScreen() {

  const params = useLocalSearchParams<{ id: string | string[] }>()

  const challengeId = Array.isArray(params.id) ? params.id[0] : params.id

  const { token, loading: authLoading } = useAuthToken()
  const { colors } = useTheme()

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null)

  const [loading, setLoading] = useState(true)

  const [starting, setStarting] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const prevAttemptStatus = useRef<string | null>(null)



  const load = useCallback(async () => {

    if (!token || !challengeId) return

    setError(null)

    const data = (await fetchChallenge(token, challengeId)) as ChallengeDetail

    setChallenge(data)

    if (data.draftAttemptId) {

      setAttemptId(data.draftAttemptId)

    } else if (data.myAttempt?.status === 'DRAFT' || data.myAttempt?.status === 'PENDING') {

      setAttemptId(data.myAttempt.id)

    }

    // Celebrate when attempt transitions from PENDING to APPROVED
    const newStatus = data.myAttempt?.status ?? null
    if (prevAttemptStatus.current === 'PENDING' && newStatus === 'APPROVED') {
      hapticSuccess()
      setCelebrating(true)
    }
    prevAttemptStatus.current = newStatus

  }, [token, challengeId])



  useEffect(() => {

    if (!token || !challengeId) return

    setLoading(true)

    load()

      .catch((e) =>

        setError(e instanceof Error ? e.message : 'Could not load this challenge.')

      )

      .finally(() => setLoading(false))

  }, [token, challengeId, load])



  useFocusEffect(

    useCallback(() => {

      if (!token || !challengeId) return

      load().catch((e) =>

        setError(e instanceof Error ? e.message : 'Could not load this challenge.')

      )

    }, [token, challengeId, load])

  )



  useEffect(() => {

    if (!token || !challengeId || !needsReviewPolling(challenge)) return

    const interval = setInterval(() => {

      load().catch(() => {})

    }, 3000)

    return () => clearInterval(interval)

  }, [token, challengeId, challenge, load])



  const onStart = async () => {

    if (!token || !challengeId) return

    setStarting(true)

    setError(null)

    try {

      const { attemptId: id } = await startChallengeAttempt(token, challengeId)

      setAttemptId(id)

      await load()

    } catch (e) {

      setError(e instanceof Error ? e.message : 'Could not start challenge')

    } finally {

      setStarting(false)

    }

  }



  if (authLoading || loading) return <AuthLoading />



  const cat = challenge

    ? (CATEGORY_STYLES[challenge.category] ?? CATEGORY_STYLES.FUNNY)

    : null



  const myStatus = challenge?.myAttempt?.status

  const showProofUpload =

    !!attemptId &&

    !!token &&

    challenge?.status === 'ACTIVE' &&

    challenge.prerequisiteMet &&

    myStatus === 'DRAFT'



  const showAttemptPending = myStatus === 'PENDING'

  const showAttemptApproved = myStatus === 'APPROVED'

  const showAttemptRejected = myStatus === 'REJECTED'



  return (

    <Screen padded={false}>

      <View style={[styles.topBar, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>

        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={12}>

          <Ionicons name="chevron-back" size={24} color={colors.foreground} />

        </Pressable>

        <Text style={[styles.topTitle, { color: colors.foreground }]} numberOfLines={1}>

          Challenge

        </Text>

        <Pressable onPress={() => setShareOpen(true)} style={styles.back} hitSlop={12}>
          <Ionicons name="share-outline" size={22} color={colors.foreground} />
        </Pressable>

      </View>



      {!challenge ? (

        <View style={styles.centered}>

          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>{error ?? 'Challenge not found.'}</Text>

        </View>

      ) : (

        <ScrollView contentContainerStyle={styles.content}>

          {cat && (

            <View style={[styles.badge, { backgroundColor: cat.bg }]}>

              <Text style={[styles.badgeText, { color: cat.text }]}>

                {CATEGORY_LABELS[challenge.category]}

              </Text>

            </View>

          )}

          <Text style={[styles.title, { color: colors.foreground }]}>{challenge.title}</Text>

          <View style={styles.metaRow}>

            <Text style={[styles.meta, { color: colors.mutedForeground }]}>

              difficulty {challenge.difficulty}/5 · @{challenge.creator.username}

            </Text>

          </View>

          <Text style={[styles.description, { color: colors.foreground }]}>{challenge.description}</Text>



          {challenge.status === 'ARCHIVED' && (

            <View style={[styles.notice, { backgroundColor: colors.muted }]}>

              <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>

                This challenge is closed — no new attempts. Past completions are still visible.

              </Text>

            </View>

          )}



          {challenge.prerequisiteChallenge && !challenge.prerequisiteMet && (

            <View style={[styles.notice, { backgroundColor: colors.muted }]}>

              <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>

                Complete “{challenge.prerequisiteChallenge.title}” first to unlock this

                challenge.

              </Text>

            </View>

          )}



          {error && <Text style={[styles.inlineError, { color: colors.destructive }]}>{error}</Text>}



          {showAttemptApproved && challenge.myAttempt && (

            <View style={[styles.notice, styles.successNotice]}>

              <Text style={[styles.noticeTitle, { color: '#2d6a4f' }]}>Completed</Text>

              <Text style={[styles.noticeText, { color: '#2d6a4f' }]}>

                Approved {formatTimestamp(challenge.myAttempt.updatedAt)} (

                {formatRelativeTime(challenge.myAttempt.updatedAt)})

              </Text>

            </View>

          )}



          {showAttemptPending && (

            <View style={[styles.notice, { backgroundColor: colors.muted }]}>

              <Text style={[styles.noticeTitle, { color: colors.foreground }]}>Under review</Text>

              <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>

                Your proof was submitted and is being reviewed. This screen refreshes automatically.

              </Text>

            </View>

          )}



          {showAttemptRejected && (

            <View style={[styles.notice, styles.rejectNotice]}>

              <Text style={[styles.noticeTitle, { color: '#b91c1c' }]}>Not approved</Text>

              <Text style={[styles.noticeText, { color: '#b91c1c' }]}>

                Your last attempt was rejected. You can try again below.

              </Text>

            </View>

          )}



          {showProofUpload ? (

            <ProofUploader

              attemptId={attemptId}

              accessToken={token!}

              onSuccess={() => load().catch(() => {})}

            />

          ) : challenge.status === 'PENDING_REVIEW' && challenge.isCreator ? (

            <View style={[styles.notice, { backgroundColor: colors.muted }]}>

              <Text style={[styles.noticeTitle, { color: colors.foreground }]}>Review in progress</Text>

              <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>

                {challenge.aiReviewNote === AI_REVIEW_IN_PROGRESS

                  ? 'AI review is running (usually 10–20 seconds). This screen updates automatically.'

                  : (challenge.aiReviewNote ?? 'Waiting for AI or moderator approval.')}

              </Text>

            </View>

          ) : challenge.status === 'REJECTED' && challenge.isCreator ? (

            <View style={[styles.notice, styles.rejectNotice]}>

              <Text style={[styles.noticeTitle, { color: '#b91c1c' }]}>Not approved</Text>

              <Text style={[styles.noticeText, { color: '#b91c1c' }]}>

                {challenge.aiReviewNote ?? 'This challenge was not approved.'}

              </Text>

            </View>

          ) : challenge.status === 'ACTIVE' &&

            !showAttemptPending &&

            !showAttemptApproved &&

            challenge.prerequisiteMet ? (

            <Button

              label={

                showAttemptRejected || challenge.draftAttemptId

                  ? 'Try again'

                  : 'Start challenge'

              }

              onPress={onStart}

              loading={starting}

            />

          ) : null}

        </ScrollView>

      )}

      {challenge ? (
        <ShareChallengeSheet
          visible={shareOpen}
          challengeId={challenge.id}
          title={challenge.title}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
      {celebrating && challenge ? (
        <CelebrationOverlay
          points={challenge.points}
          onDone={() => setCelebrating(false)}
        />
      ) : null}
    </Screen>

  )

}



const styles = StyleSheet.create({

  topBar: {

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: spacing.sm,

    paddingVertical: spacing.sm,

    borderBottomWidth: StyleSheet.hairlineWidth,

  },

  back: {

    width: 40,

    height: 40,

    alignItems: 'center',

    justifyContent: 'center',

  },

  topTitle: {

    flex: 1,

    textAlign: 'center',

    ...typography.label,

  },

  content: {

    padding: spacing.md,

    paddingBottom: spacing.xl,

  },

  badge: {

    alignSelf: 'flex-start',

    paddingHorizontal: 10,

    paddingVertical: 4,

    borderRadius: radius.full,

    marginBottom: spacing.sm,

  },

  badgeText: {

    ...typography.caption,

    fontWeight: '600',

  },

  title: {

    ...typography.heading,

    fontSize: 24,

    marginBottom: spacing.xs,

  },

  metaRow: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: spacing.md,

    gap: spacing.sm,

  },

  meta: {

    ...typography.caption,

    flex: 1,

  },

  description: {

    ...typography.body,

    marginBottom: spacing.lg,

  },

  notice: {

    borderRadius: radius.md,

    padding: spacing.md,

    marginBottom: spacing.md,

  },

  successNotice: {

    backgroundColor: '#d8f3dc',

  },

  rejectNotice: {

    backgroundColor: '#fee2e2',

  },

  noticeTitle: {

    ...typography.label,

    marginBottom: 4,

  },

  noticeText: {

    ...typography.caption,

  },

  inlineError: {

    ...typography.caption,

    marginBottom: spacing.sm,

  },

  centered: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    padding: spacing.lg,

  },

  errorText: {

    ...typography.body,

    textAlign: 'center',

  },

})


