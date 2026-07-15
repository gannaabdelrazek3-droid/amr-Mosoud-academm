import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json()

  const player = await prisma.player.findFirst({
    where: { phone },
  })

  if (!player) {
    return NextResponse.json({ error: 'رقم غير مسجل' }, { status: 401 })
  }

  const expectedCode = phone.slice(-4)

  if (code !== expectedCode) {
    return NextResponse.json({ error: 'كود غلط' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true, playerId: player.id })
  response.cookies.set('player_id', player.id, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}