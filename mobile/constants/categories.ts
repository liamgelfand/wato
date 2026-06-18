export type ChallengeCategory =
  | 'FITNESS'
  | 'SKILL'
  | 'CREATIVITY'
  | 'ADVENTURE'
  | 'FUNNY'

export const CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  FITNESS: 'Fitness',
  SKILL: 'Skill',
  CREATIVITY: 'Creativity',
  ADVENTURE: 'Adventure',
  FUNNY: 'Funny',
}

export const CATEGORY_STYLES: Record<ChallengeCategory, { bg: string; text: string }> = {
  FITNESS: { bg: '#d8f3dc', text: '#2d6a4f' },
  SKILL: { bg: '#dbeafe', text: '#1d4e6f' },
  CREATIVITY: { bg: '#fef3c7', text: '#92400e' },
  ADVENTURE: { bg: '#ffedd5', text: '#9a3412' },
  FUNNY: { bg: '#fce7f3', text: '#9d174d' },
}
