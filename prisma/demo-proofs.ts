import { existsSync } from 'fs'
import { copyFile, mkdir, writeFile } from 'fs/promises'
import path from 'path'
import type { ChallengeCategory } from '@prisma/client'

/** Tiny valid JPEG used when offline or fetch fails. */
const FALLBACK_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  'base64'
)

export type DemoProofAsset = {
  file: string
  url: string
  proofType: string
  category?: ChallengeCategory
}

// Use specific Picsum photo IDs that visually match each challenge category.
// IDs tested against picsum.photos to confirm relevance.
const DEMO_PROOF_SPECS: Array<{
  file: string
  picId: number
  width: number
  height: number
  proofType: string
  category: ChallengeCategory
}> = [
  // Fitness – person working out / pushups pose
  { file: 'fitness.jpg', picId: 1043, width: 800, height: 1000, category: 'FITNESS', proofType: 'image/jpeg' },
  // Creativity – art supplies / colorful scene
  { file: 'creative.jpg', picId: 176, width: 800, height: 1000, category: 'CREATIVITY', proofType: 'image/jpeg' },
  // Skill – books / focused study
  { file: 'skill.jpg', picId: 256, width: 800, height: 1000, category: 'SKILL', proofType: 'image/jpeg' },
  // Adventure – city street / café
  { file: 'adventure.jpg', picId: 431, width: 800, height: 1000, category: 'ADVENTURE', proofType: 'image/jpeg' },
  // Funny – colorful/playful scene
  { file: 'funny.jpg', picId: 305, width: 800, height: 1000, category: 'FUNNY', proofType: 'image/jpeg' },
  // Sunrise – golden hour outdoor landscape
  { file: 'sunrise.jpg', picId: 975, width: 800, height: 1000, category: 'ADVENTURE', proofType: 'image/jpeg' },
  // Cooking – kitchen / food
  { file: 'cooking.jpg', picId: 292, width: 800, height: 1000, category: 'SKILL', proofType: 'image/jpeg' },
  // Origami / craft – hands with paper
  { file: 'craft.jpg', picId: 326, width: 800, height: 1000, category: 'CREATIVITY', proofType: 'image/jpeg' },
]

// Map challenge titles to specific proof image files
const CHALLENGE_TITLE_PROOF: Record<string, string> = {
  '30 Pushups in 1 Minute': 'fitness.jpg',
  'Plank for 2 Minutes': 'fitness.jpg',
  '100 Jumping Jacks': 'fitness.jpg',
  'Draw a Self-Portrait': 'creative.jpg',
  'Write a Haiku About Your Day': 'creative.jpg',
  'Origami Crane': 'craft.jpg',
  'Learn 10 Words in a New Language': 'skill.jpg',
  'Solve a Rubiks Cube': 'skill.jpg',
  'Cook a New Recipe': 'cooking.jpg',
  'Visit a New Coffee Shop': 'adventure.jpg',
  'Take a Photo at Sunrise': 'sunrise.jpg',
  'Random Act of Kindness': 'adventure.jpg',
  'Tell 5 Dad Jokes': 'funny.jpg',
  'Wear Mismatched Socks All Day': 'funny.jpg',
  'Speak in Rhymes for 10 Minutes': 'funny.jpg',
}

function uploadsRoot(): string {
  return process.env.UPLOADS_DIR?.trim() || path.join(process.cwd(), 'public', 'uploads')
}

async function downloadPicsumImage(id: number, width: number, height: number): Promise<Buffer> {
  const url = `https://picsum.photos/id/${id}/${width}/${height}.jpg`
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`Failed to download image id=${id} (${res.status})`)
  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.length < 500) throw new Error('Downloaded image too small')
  return buffer
}

/** A tiny publicly-hosted MP4 for use as a demo video proof. */
async function downloadDemoVideo(): Promise<Buffer> {
  // Small public domain video (~300KB)
  const url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`Failed to download demo video (${res.status})`)
  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.length < 1000) throw new Error('Downloaded video too small')
  return buffer
}

/** Write demo proof images to disk and return their public URL paths. */
export async function ensureDemoProofFiles(): Promise<DemoProofAsset[]> {
  const demoDir = path.join(uploadsRoot(), 'demo')
  await mkdir(demoDir, { recursive: true })

  const assets: DemoProofAsset[] = []

  for (const spec of DEMO_PROOF_SPECS) {
    const filePath = path.join(demoDir, spec.file)
    // Always re-download if missing — don't use stale cached files
    if (!existsSync(filePath)) {
      let buffer: Buffer
      try {
        buffer = await downloadPicsumImage(spec.picId, spec.width, spec.height)
      } catch {
        buffer = FALLBACK_JPEG
      }
      await writeFile(filePath, buffer)
    }

    assets.push({
      file: spec.file,
      url: `/uploads/demo/${spec.file}`,
      proofType: spec.proofType,
      category: spec.category,
    })
  }

  // Demo video proof
  const videoFile = 'fitness-video.mp4'
  const videoPath = path.join(demoDir, videoFile)
  if (!existsSync(videoPath)) {
    try {
      const videoBuffer = await downloadDemoVideo()
      await writeFile(videoPath, videoBuffer)
      console.log(`✓ Downloaded demo video (${Math.round(videoBuffer.length / 1024)}KB)`)
    } catch (e) {
      console.warn('⚠ Could not download demo video, skipping:', e instanceof Error ? e.message : e)
    }
  }

  if (existsSync(videoPath)) {
    assets.push({
      file: videoFile,
      url: `/uploads/demo/${videoFile}`,
      proofType: 'video/mp4',
      category: 'FITNESS',
    })
  }

  const legacyPath = path.join(uploadsRoot(), 'demo-proof.jpg')
  if (!existsSync(legacyPath)) {
    const legacySource = path.join(demoDir, DEMO_PROOF_SPECS[0].file)
    if (existsSync(legacySource)) {
      await copyFile(legacySource, legacyPath)
    } else {
      await writeFile(legacyPath, FALLBACK_JPEG)
    }
  }

  return assets
}

export async function ensureDemoAvatars(): Promise<Map<string, string>> {
  const demoDir = path.join(uploadsRoot(), 'demo')
  await mkdir(demoDir, { recursive: true })
  const urls = new Map<string, string>()

  // Specific portrait-style Picsum IDs for each demo user
  const avatarPicIds = [64, 91, 177, 453, 519, 614, 658, 718, 783, 842]

  for (let i = 1; i <= 10; i++) {
    const file = `avatar-demo${i}.jpg`
    const filePath = path.join(demoDir, file)
    if (!existsSync(filePath)) {
      let buffer: Buffer
      try {
        const picId = avatarPicIds[(i - 1) % avatarPicIds.length]
        buffer = await downloadPicsumImage(picId, 400, 400)
      } catch {
        buffer = FALLBACK_JPEG
      }
      await writeFile(filePath, buffer)
    }
    urls.set(`demo${i}`, `/uploads/demo/${file}`)
  }

  return urls
}

export function pickDemoProof(assets: DemoProofAsset[], index: number): DemoProofAsset {
  return assets[index % assets.length]
}

export function proofForCategory(
  assets: DemoProofAsset[],
  category: ChallengeCategory
): DemoProofAsset {
  return assets.find((a) => a.category === category) ?? assets[0]
}

export function proofForChallenge(
  assets: DemoProofAsset[],
  title: string,
  category: ChallengeCategory
): DemoProofAsset {
  const file = CHALLENGE_TITLE_PROOF[title]
  if (file) {
    const match = assets.find((a) => a.file === file)
    if (match) return match
  }
  return proofForCategory(assets, category)
}

/** Paths that point at missing or placeholder demo files. */
export const STALE_DEMO_PROOF_URLS = [
  '/uploads/demo-proof.jpg',
  '/uploads/demo-proof.png',
  '/uploads/demo-proof.jpeg',
]
