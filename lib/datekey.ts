export function toDateKey(input: string): string {
  return input.slice(0, 10)
}

export function dateKeyToUtcNoon(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00.000Z`)
}