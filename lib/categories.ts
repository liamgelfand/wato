export const CHALLENGE_CATEGORIES = [
  'FITNESS',
  'SKILL',
  'CREATIVITY',
  'ADVENTURE',
  'FUNNY',
] as const

export type ChallengeCategoryName = (typeof CHALLENGE_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<ChallengeCategoryName, string> = {
  FITNESS: 'Fitness',
  SKILL: 'Skill',
  CREATIVITY: 'Creativity',
  ADVENTURE: 'Adventure',
  FUNNY: 'Funny',
}

/** Distinct category colors — warm coral/pine palette, not generic blue/purple */
export const CATEGORY_COLORS: Record<ChallengeCategoryName, string> = {
  FITNESS: 'bg-[oklch(0.88_0.08_155)] text-[oklch(0.32_0.1_155)]',
  SKILL: 'bg-[oklch(0.88_0.06_200)] text-[oklch(0.32_0.08_200)]',
  CREATIVITY: 'bg-[oklch(0.9_0.1_75)] text-[oklch(0.38_0.12_75)]',
  ADVENTURE: 'bg-[oklch(0.88_0.1_45)] text-[oklch(0.38_0.14_40)]',
  FUNNY: 'bg-[oklch(0.9_0.08_330)] text-[oklch(0.38_0.1_330)]',
}
