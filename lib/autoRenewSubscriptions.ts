import { prisma } from '@/lib/prisma'

export async function autoRenewTenantSubscriptions(tenantId: string) {
  const now = new Date()

  const players = await prisma.player.findMany({
    where: { tenantId },
    include: {
      subscriptions: { orderBy: { endDate: 'desc' }, take: 1 },
    },
  })

  for (const player of players) {
    const latest = player.subscriptions[0]
    if (!latest) continue
    if (latest.isStopped) continue
    if (!latest.autoRenew) continue
    if (latest.paymentStatus !== 'PAID') continue
    if (new Date(latest.endDate) > now) continue

    const durationMs = new Date(latest.endDate).getTime() - new Date(latest.startDate).getTime()
    const durationDays = Math.max(1, Math.round(durationMs / (1000 * 60 * 60 * 24)))

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + durationDays)

    const newSub = await prisma.subscription.create({
      data: {
        playerId: player.id,
        tenantId,
        totalSessions: latest.totalSessions,
        remaining: latest.totalSessions,
        startDate,
        endDate,
        totalAmount: latest.totalAmount,
        paidAmount: latest.totalAmount,
        remainingAmount: 0,
        paymentStatus: 'PAID',
        autoRenew: true,
        isStopped: false,
      },
    })

    await prisma.payment.create({
      data: {
        tenantId,
        playerId: player.id,
        subscriptionId: newSub.id,
        amount: Number(latest.totalAmount),
        source: 'SUBSCRIPTION',
        description: `تجديد تلقائي شهري بنفس قيمة الاشتراك السابق (${Number(latest.totalAmount).toFixed(2)} جنيه)`,
      },
    })
  }
}