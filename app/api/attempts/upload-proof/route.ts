import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { storage } from '@/lib/storage'
import path from 'path'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const attemptId = formData.get('attemptId') as string

    if (!file || !attemptId) {
      return NextResponse.json(
        { error: 'Missing file or attemptId' },
        { status: 400 }
      )
    }

    // Verify attempt ownership
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    })

    if (!attempt || attempt.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Attempt not found or unauthorized' },
        { status: 404 }
      )
    }

    if (attempt.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot upload proof for this attempt' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB' },
        { status: 400 }
      )
    }

    // Upload file
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = path.extname(file.name)
    const filePath = `${attempt.userId}/${attemptId}${ext}`
    
    const storageProvider = storage()
    const proofUrl = await storageProvider.uploadFile(buffer, filePath, file.type)

    // Update attempt
    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        proofUrl,
        proofType: file.type,
        proofMetadata: {
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
        },
        status: 'PENDING',
      },
    })

    // TODO: AI proof verification hook can be called here
    // await verifyProofWithAI(proofUrl, attempt.challengeId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Proof upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
