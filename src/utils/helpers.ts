export function generatePrivateRoom(): string {
  return `sdk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function buildRoomName(
  destination: string,
  channel: string,
  userUniqueCode?: string,
): string {
  return userUniqueCode
    ? `${destination}:${channel}:${userUniqueCode}`
    : `${destination}:${channel}`
}
