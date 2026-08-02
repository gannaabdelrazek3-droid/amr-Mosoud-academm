import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const players = await prisma.featuredPlayer.findMany({
      where: { isActive: true },
      orderBy: [{ season: 'desc' }, { displayOrder: 'asc' }],
    })

    return NextResponse.json({ players })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}