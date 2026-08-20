import { prisma } from '../lib/prisma'

async function main() {
  const records = await prisma.attendance.findMany({ where: { dateKey: null } })
  console.log(`Found ${records.length} records to update`)

  for (const r of records) {
    const d = new Date(r.date)
    const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
    await prisma.attendance.update({ where: { id: r.id }, data: { dateKey } })
  }

  console.log('Done!')
}

main().finally(() => prisma.$disconnect())