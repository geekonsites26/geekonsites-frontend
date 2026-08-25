const readValue = (item = {}) => {
  if (typeof item.isRead === "boolean") return item.isRead
  if (typeof item.read === "boolean") return item.read
  if (typeof item.is_read === "boolean") return item.is_read
  return false
}

export const normalizeNotification = (item = {}) => ({
  ...item,
  id: item.id ?? item.notificationId,
  isRead: readValue(item),
  read: readValue(item),
})

export const normalizeNotifications = (items, previous = []) => {
  const previouslyRead = new Set(
    previous.filter((item) => readValue(item)).map((item) => String(item.id ?? item.notificationId))
  )
  const unique = new Map()

  for (const raw of Array.isArray(items) ? items : []) {
    const item = normalizeNotification(raw)
    if (item.id == null) continue
    const key = String(item.id)
    const current = unique.get(key)
    const isRead = item.isRead || previouslyRead.has(key) || Boolean(current?.isRead)
    unique.set(key, { ...current, ...item, isRead, read: isRead })
  }

  return [...unique.values()].sort((left, right) => {
    const a = left.createdAt ? new Date(left.createdAt).getTime() : 0
    const b = right.createdAt ? new Date(right.createdAt).getTime() : 0
    return b - a
  })
}
