// src/utils/newGroupsUtils.ts

export const ageMap: Record<string, { label: string; cls: string; icon: string }> = {
  junior: { label: '5–7',   cls: 'age-junior', icon: '🟢' },
  middle: { label: '8–10',  cls: 'age-middle', icon: '🟡' },
  senior: { label: '11–14', cls: 'age-senior', icon: '🔴' },
  adult:  { label: '15+',   cls: 'age-adult',  icon: '🟣' },
}

export function fmtDate(s: string): string {
  if (!s) return '—'
  const [y, m, d] = s.split('-')
  return `${d}.${m}.${y}`
}

export function daysDiff(s: string): number {
  const d = new Date(s), n = new Date()
  n.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.floor((n.getTime() - d.getTime()) / 86400000)
}
