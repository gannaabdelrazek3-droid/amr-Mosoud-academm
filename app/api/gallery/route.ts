import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const albums = await prisma.mediaAlbum.findMany({
      where: { isActive: true },
      include: { items: { orderBy: { order: 'asc' } } },
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    })

    return NextResponse.json({ albums })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}