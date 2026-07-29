import { prisma } from '@/lib/prisma'

export async function logAudit({
  tenantId,
  userId,
  userRole,
  action,
  entity,
  entityId,
  details,
}: {
  tenantId: string
  userId: string
  userRole: string
  action: string
  entity: string
  entityId?: string
  details?: string
}) {
  try {
    await prisma.auditLog.create({
      data: { tenantId, userId, userRole, action, entity, entityId, details },
    })
  } catch (err) {
    console.error('Audit log failed:', err)
  }
}