import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const coach = await prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        title: true,
        bio: true,
        avatarUrl: true,
        yearsExperience: true,
        playersTrained: true,
        belts: true,
        whatsapp: true,
        facebookUrl: true,
        instagramUrl: true,
        trainingSchedule: true,
        isActive: true,
        role: true,
        coachSports: { include: { sport: true } },
        achievements: { orderBy: { order: 'asc' } },
        certificates: { orderBy: { order: 'asc' } },
        galleryItems: { orderBy: { order: 'asc' } },
      },
    })

    if (!coach || coach.role !== 'COACH' || !coach.isActive) {
      return NextResponse.json({ error: 'المدرب غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ coach })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}