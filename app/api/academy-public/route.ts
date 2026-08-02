import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst()
    if (!tenant) return NextResponse.json({ info: null, news: [] })

    const [info, news] = await Promise.all([
      prisma.academyInfo.findUnique({ where: { tenantId: tenant.id } }),
      prisma.newsPost.findMany({
        where: { tenantId: tenant.id, isActive: true },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        take: 6,
      }),
    ])

    return NextResponse.json({ info, news })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'حدثت مشكلة، حاول مرة أخرى' }, { status: 500 })
  }
}