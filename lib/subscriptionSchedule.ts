import { prisma } from '@/lib/prisma'

/**
 * تحسب تاريخ انتهاء الاشتراك تلقائيًا بناءً على عدد الحصص المطلوبة
 * وعدد أيام تدريب المدرب المختار في الأسبوع لنفس الرياضة.
 * لو المدرب مش عنده مواعيد محددة، بيفترض تمرين مرة واحدة أسبوعيًا كحد أدنى آمن.
 */
export async function calculateSubscriptionEndDate(
  coachId: string | null,
  sportId: string | null,
  totalSessions: number,
  startDate: Date
): Promise<Date> {
  let sessionsPerWeek = 1

  if (coachId && sportId) {
    const schedules = await prisma.coachSchedule.findMany({
      where: { coachId, sportId },
    })
    const uniqueDays = new Set(schedules.map((s) => s.dayOfWeek))
    if (uniqueDays.size > 0) sessionsPerWeek = uniqueDays.size
  }

  const weeksNeeded = Math.ceil(totalSessions / sessionsPerWeek)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + weeksNeeded * 7)
  return endDate
}