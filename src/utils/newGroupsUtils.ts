// src/utils/newGroupsUtils.ts

export interface AgeGroupMeta {
  key: string;
  label: string;
  cls: string;
  icon: string;
}

export const CANONICAL_AGE_GROUPS: AgeGroupMeta[] = [
  { key: 'junior', label: '5-7',   cls: 'age-junior', icon: '🟢' },
  { key: 'middle', label: '8-10',  cls: 'age-middle', icon: '🟡' },
  { key: 'senior', label: '11-14', cls: 'age-senior', icon: '🔴' },
  { key: 'adult',  label: '15+',   cls: 'age-adult',  icon: '🟣' },
]

export const ageMap: Record<string, AgeGroupMeta> = {
  // Canonical Slugs
  'junior': CANONICAL_AGE_GROUPS[0],
  'middle': CANONICAL_AGE_GROUPS[1],
  'senior': CANONICAL_AGE_GROUPS[2],
  'adult':  CANONICAL_AGE_GROUPS[3],
  
  // Explicit Range Aliases (Standardized with regular hyphen)
  '5-7':    CANONICAL_AGE_GROUPS[0],
  '8-10':   CANONICAL_AGE_GROUPS[1],
  '11-14':  CANONICAL_AGE_GROUPS[2],
  '15+':    CANONICAL_AGE_GROUPS[3],

  // Legacy/Alternate Range Aliases (Maintenance for existing data in DB)
  '5–7':    CANONICAL_AGE_GROUPS[0],
  '7-9':    { label: '7-9',   cls: 'age-junior', icon: '🟢', key: 'junior' },
  '8–10':   CANONICAL_AGE_GROUPS[1],
  '10-12':  { label: '10-12', cls: 'age-middle', icon: '🟡', key: 'middle' },
  '11–14':  CANONICAL_AGE_GROUPS[2],
  '13-15':  { label: '13-15', cls: 'age-senior', icon: '🔴', key: 'senior' },
  '16+':    { label: '16+',   cls: 'age-adult',  icon: '🟣', key: 'adult' },
}


export function fmtDate(s: string): string {
  if (!s) return '—'
  const [y, m, d] = s.split('-')
  return `${d}.${m}.${y}`
}

export function daysDiff(s: string): number {
  if (!s) return 0
  
  // Parse s as UTC midnight
  const target = new Date(s + 'T00:00:00Z')
  
  // Get current UTC date at midnight
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  
  const diffTime = today.getTime() - target.getTime()
  return Math.floor(diffTime / 86400000)
}
