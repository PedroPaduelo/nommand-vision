export function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours()
  if (hour < 12) return t('greeting.morning')
  if (hour < 18) return t('greeting.afternoon')
  return t('greeting.evening')
}

export function timestamp(): string {
  return new Date().toISOString().substring(11, 23)
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
