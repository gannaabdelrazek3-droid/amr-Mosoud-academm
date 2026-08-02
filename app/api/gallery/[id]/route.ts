import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const album = await prisma.mediaAlbum.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    })

    if (!album || !album.isActive) {
      return NextResponse.json({ error: 'الألبوم غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ album })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}