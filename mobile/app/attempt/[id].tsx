import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Screen } from '../../components/ui/screen'
import { AuthLoading, useAuthToken } from '../../hooks/use-auth-token'
import {
  API_URL,
  commentOnAttempt,
  fetchAttempt,
  resolveMediaUrl,
  upvoteAttempt,
  upvoteComment,
} from '../../lib/api'
import { formatRelativeTime, formatTimestamp } from '../../lib/format-time'
import { ProofMedia } from '../../components/media/proof-media'
import { hapticLight, hapticMedium, hapticSuccess } from '../../lib/haptics'
import { type AppColors, radius, spacing, typography, shadows } from '../../constants/theme'
import { useTheme } from '../../hooks/use-theme'

type CommentUser = {
  id: string
  username: string
  name: string | null
  avatarUrl?: string | null
}

type Comment = {
  id: string
  body: string
  createdAt: string
  user: CommentUser
  upvoteCount: number
  userUpvoted: boolean
  replies: Comment[]
}

type AttemptPost = {
  id: string
  updatedAt: string
  proofUrl: string | null
  proofType: string | null
  user: CommentUser
  challenge: { id: string; title: string; points: number }
  engagement: {
    canEngage: boolean
    upvoteCount: number
    userUpvoted: boolean
    comments: Comment[]
  }
}

function displayName(user: CommentUser) {
  return user.name ?? user.username
}

function initials(user: CommentUser) {
  return displayName(user).split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function AttemptPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { token, loading: authLoading } = useAuthToken()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<ScrollView>(null)
  const [post, setPost] = useState<AttemptPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentBody, setCommentBody] = useState('')
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    if (!token || !id) return
    const data = await fetchAttempt(token, id)
    setPost(data)
  }, [token, id])

  useEffect(() => {
    if (!token || !id) return
    load()
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, id, load])

  const toggleLike = async () => {
    if (!token || !post) return
    hapticLight()
    const result = await upvoteAttempt(token, post.id)
    if (result.upvoted) hapticSuccess()
    setPost({
      ...post,
      engagement: {
        ...post.engagement,
        upvoteCount: result.count,
        userUpvoted: result.upvoted,
      },
    })
  }

  const submitComment = async () => {
    if (!token || !post || !commentBody.trim() || submitting) return
    hapticMedium()
    setSubmitting(true)
    try {
      await commentOnAttempt(token, post.id, commentBody.trim(), replyTo?.id)
      setCommentBody('')
      setReplyTo(null)
      Keyboard.dismiss()
      await load()
    } finally {
      setSubmitting(false)
    }
  }

  const toggleCommentLike = async (commentId: string) => {
    if (!token || !post) return
    hapticLight()
    await upvoteComment(token, commentId)
    await load()
  }

  const onShare = async () => {
    if (!post) return
    await Share.share({
      message: `${displayName(post.user)} completed "${post.challenge.title}" on Wato! ${API_URL}/attempt/${post.id}`,
    })
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <View key={comment.id} style={[styles.comment, isReply && styles.reply]}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>{displayName(comment.user)}</Text>
        <Text style={styles.commentTime}>{formatRelativeTime(comment.createdAt)}</Text>
      </View>
      <Text style={styles.commentBody}>{comment.body}</Text>
      <View style={styles.commentActions}>
        <Pressable onPress={() => toggleCommentLike(comment.id)} style={styles.commentAction}>
          <Ionicons
            name={comment.userUpvoted ? 'heart' : 'heart-outline'}
            size={16}
            color={comment.userUpvoted ? colors.primary : colors.mutedForeground}
          />
          <Text style={styles.commentActionText}>{comment.upvoteCount || ''}</Text>
        </Pressable>
        {!isReply && post?.engagement.canEngage ? (
          <Pressable onPress={() => setReplyTo(comment)} style={styles.commentAction}>
            <Text style={styles.commentActionText}>Reply</Text>
          </Pressable>
        ) : null}
      </View>
      {comment.replies?.map((r) => renderComment(r, true))}
    </View>
  )

  if (authLoading || loading) return <AuthLoading />
  if (!post) {
    return (
      <Screen>
        <Text style={{ color: colors.destructive, textAlign: 'center', padding: spacing.lg }}>Could not load this post.</Text>
      </Screen>
    )
  }

  const proofUri = resolveMediaUrl(post.proofUrl)
  const keyboardOffset = insets.top + 48
  const hasProof = !!proofUri
  const styles = makeStyles(colors)

  return (
    <Screen padded={false}>
      {/* Full-bleed hero header */}
      <View style={hasProof ? styles.heroWrap : styles.topBar}>
        {hasProof ? (
          <>
            <ProofMedia uri={proofUri!} proofType={post.proofType} style={styles.hero} />
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'transparent']}
              style={styles.heroTopGradient}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.heroBottomGradient}
            />
            <View style={[styles.heroNav, { paddingTop: insets.top + 8 }]}>
              <Pressable onPress={() => router.back()} style={styles.heroNavBtn}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </Pressable>
              <Pressable onPress={onShare} style={styles.heroNavBtn}>
                <Ionicons name="share-outline" size={22} color="#fff" />
              </Pressable>
            </View>
            <View style={styles.heroFooter}>
              <Text style={styles.heroName}>{displayName(post.user)}</Text>
              <Text style={styles.heroChallenge}>{post.challenge.title}</Text>
              <Text style={styles.heroTime}>{formatRelativeTime(post.updatedAt)}</Text>
            </View>
          </>
        ) : (
          <>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.foreground} />
            </Pressable>
            <Text style={styles.topTitle} numberOfLines={1}>{displayName(post.user)}</Text>
            <Pressable onPress={onShare} style={styles.backBtn}>
              <Ionicons name="share-outline" size={22} color={colors.foreground} />
            </Pressable>
          </>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!hasProof && (
            <>
              <Text style={styles.completedMeta}>
                Completed{' '}
                <Text style={styles.challengeLink}>{post.challenge.title}</Text>
              </Text>
              <Text style={styles.timestamp}>{formatTimestamp(post.updatedAt)}</Text>
            </>
          )}

          {hasProof ? (
            <View style={styles.actionsCard}>
              <Pressable onPress={toggleLike} style={styles.likeBtn}>
                <Ionicons
                  name={post.engagement.userUpvoted ? 'heart' : 'heart-outline'}
                  size={26}
                  color={post.engagement.userUpvoted ? colors.primary : colors.foreground}
                />
                <Text style={styles.likeCount}>{post.engagement.upvoteCount}</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push(`/challenge/${post.challenge.id}`)}
                style={styles.viewChallengeBtn}
              >
                <Ionicons name="flag-outline" size={18} color={colors.primary} />
                <Text style={styles.viewChallenge}>View challenge</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.actions}>
              <Pressable onPress={toggleLike} style={styles.likeBtn}>
                <Ionicons
                  name={post.engagement.userUpvoted ? 'heart' : 'heart-outline'}
                  size={22}
                  color={post.engagement.userUpvoted ? colors.primary : colors.foreground}
                />
                <Text style={styles.likeCount}>{post.engagement.upvoteCount} likes</Text>
              </Pressable>
              <Pressable onPress={() => router.push(`/challenge/${post.challenge.id}`)}>
                <Text style={styles.viewChallenge}>View challenge →</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.commentsTitle}>
            Comments {post.engagement.comments.length > 0 ? `(${post.engagement.comments.length})` : ''}
          </Text>
          {post.engagement.comments.length === 0 ? (
            <Text style={styles.noComments}>No comments yet. Be the first!</Text>
          ) : (
            post.engagement.comments.map((c) => renderComment(c))
          )}
        </ScrollView>

        {post.engagement.canEngage ? (
          <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
            {replyTo ? (
              <View style={styles.replyBanner}>
                <Text style={styles.replyBannerText} numberOfLines={1}>
                  Replying to {displayName(replyTo.user)}
                </Text>
                <Pressable onPress={() => setReplyTo(null)}>
                  <Ionicons name="close" size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>
            ) : null}
            <View style={styles.composerRow}>
              <TextInput
                value={commentBody}
                onChangeText={setCommentBody}
                placeholder="Add a comment…"
                placeholderTextColor={colors.mutedForeground}
                style={styles.commentInput}
                multiline
                maxLength={500}
              />
              <Pressable
                onPress={submitComment}
                disabled={!commentBody.trim() || submitting}
                style={[styles.sendBtn, (!commentBody.trim() || submitting) && styles.sendDisabled]}
              >
                <Ionicons name="send" size={18} color={colors.primaryForeground} />
              </Pressable>
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  )
}

const HERO_HEIGHT = 340

function makeStyles(colors: AppColors) { return StyleSheet.create({
  flex: { flex: 1 },

  // Full-bleed hero
  heroWrap: { height: HERO_HEIGHT, position: 'relative', backgroundColor: '#000' },
  hero: { width: '100%', height: HERO_HEIGHT },
  heroTopGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  heroBottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  heroNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  heroNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFooter: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  heroName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: '#fff',
    letterSpacing: -0.2,
  },
  heroChallenge: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 8 },
  heroTime: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },

  // Top bar (no media)
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, textAlign: 'center', ...typography.label, fontSize: 16, color: colors.foreground },

  scroll: { padding: spacing.md, paddingBottom: spacing.xl },

  completedMeta: { ...typography.body, color: colors.foreground },
  challengeLink: { fontFamily: 'DMSans_700Bold', color: colors.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: spacing.md },
  timestamp: { ...typography.caption, color: colors.mutedForeground },

  actionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeCount: { ...typography.label, color: colors.foreground },
  viewChallengeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewChallenge: { ...typography.caption, color: colors.primary, fontFamily: 'DMSans_600SemiBold' },

  commentsTitle: {
    ...typography.heading,
    fontSize: 18,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  noComments: { ...typography.caption, color: colors.mutedForeground, marginBottom: spacing.md },
  comment: { marginBottom: spacing.md },
  reply: { marginLeft: spacing.lg, marginTop: spacing.sm },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  commentAuthor: { ...typography.label, fontSize: 14, color: colors.foreground },
  commentTime: { ...typography.caption, color: colors.mutedForeground },
  commentBody: { ...typography.body, fontSize: 15, marginTop: 4, color: colors.foreground },
  commentActions: { flexDirection: 'row', gap: spacing.md, marginTop: 6 },
  commentAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentActionText: { ...typography.caption, color: colors.mutedForeground },

  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  replyBannerText: { ...typography.caption, color: colors.mutedForeground, flex: 1 },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.background,
    ...typography.body,
    fontSize: 15,
    color: colors.foreground,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.5 },
  error: { ...typography.body, color: colors.destructive, textAlign: 'center', padding: spacing.lg },
}) }
