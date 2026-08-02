import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const tournament = await prisma.tournamentEvent.findUnique({
      where: { id },
      include: {
        media: { orderBy: { order: 'asc' } },
        participants: { orderBy: { order: 'asc' } },
      },
    })

    if (!tournament || !tournament.isActive) {
      return NextResponse.json({ error: 'البطولة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ tournament })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}