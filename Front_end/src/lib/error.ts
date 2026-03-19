export function getReadableError(err: unknown, fallback: string): string {
  if (typeof err === 'string' && err.trim()) {
    return err
  }

  if (err && typeof err === 'object') {
    const record = err as Record<string, unknown>

    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message
    }

    const detail = record.detail
    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }
    if (Array.isArray(detail)) {
      const messages = detail
        .map(item => {
          if (typeof item === 'string') return item
          if (item && typeof item === 'object') {
            const entry = item as Record<string, unknown>
            const loc = Array.isArray(entry.loc) ? entry.loc.join('.') : ''
            const msg = typeof entry.msg === 'string' ? entry.msg : ''
            return [loc, msg].filter(Boolean).join(': ')
          }
          return ''
        })
        .filter(Boolean)
      if (messages.length > 0) return messages.join('; ')
    }

    if (record.response && typeof record.response === 'object') {
      const response = record.response as Record<string, unknown>
      if (response.data && typeof response.data === 'object') {
        const data = response.data as Record<string, unknown>
        if (typeof data.detail === 'string' && data.detail.trim()) {
          return data.detail
        }
      }
    }
  }

  return fallback
}
