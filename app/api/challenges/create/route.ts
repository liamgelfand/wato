import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createChallengeSchema } from '@/lib/validations'
import { validateChallengeContent, calculateChallengePoints } from '@/lib/moderation'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input schema
    const validation = createChallengeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, description, category, difficulty } = validation.data

    // Content moderation check
    const contentValidation = validateChallengeContent({
      title,
      description,
      category,
    })

    if (!contentValidation.isValid) {
      return NextResponse.json(
        { errors: contentValidation.errors },
        { status: 400 }
      )
    }

    // Calculate points
    const points = calculateChallengePoints(difficulty)

    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        creatorId: (session.user as any).id,
        title,
        description,
        category: category as any,
        difficulty,
        basePoints: 10,
        points,
        status: 'ACTIVE',
      },
    })

    return NextResponse.json(challenge, { status: 201 })
  } catch (error) {
    console.error('Challenge creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
