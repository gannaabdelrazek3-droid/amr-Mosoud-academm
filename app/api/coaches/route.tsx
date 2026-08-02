import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const coaches = await prisma.profile.findMany({
      where: { role: 'COACH', isActive: true },
      select: {
        id: true,
        fullName: true,
        title: true,
        bio: true,
        avatarUrl: true,
        yearsExperience: true,
        playersTrained: true,
        belts: true,
        coachSports: { include: { sport: true } },
        achievements: { orderBy: { order: 'asc' } },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ coaches })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}