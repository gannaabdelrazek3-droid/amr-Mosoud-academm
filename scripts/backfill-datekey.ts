import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // جلب كل سجلات الحضور لتحديثها بالـ dateKey المناسب لتجنب مشاكل النوع
  const records = await prisma.attendance.findMany()
  console.log(`Found ${records.length} records to process`)

  for (const r of records) {
    // استخراج التاريخ بصيغة YYYY-MM-DD من حقل الـ date الموجود فعلياً
    const dateStr = new Date(r.date).toISOString().split('T')[0]

    await prisma.attendance.update({
      where: { id: r.id },
      data: { dateKey: dateStr },
    })
  }

  console.log('Backfill completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })