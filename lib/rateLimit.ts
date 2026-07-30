const requestLog = new Map<string, number[]>()

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const timestamps = requestLog.get(key) || []

  const recentTimestamps = timestamps.filter((t) => now - t < windowMs)

  if (recentTimestamps.length >= maxRequests) {
    requestLog.set(key, recentTimestamps)
    return false
  }

  recentTimestamps.push(now)
  requestLog.set(key, recentTimestamps)

  if (requestLog.size > 5000) {
    const oldestKey = requestLog.keys().next().value
    if (oldestKey) requestLog.delete(oldestKey)
  }

  return true
}