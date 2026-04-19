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

/**
 * Normalizes various day-of-week strings/numbers to a standard key (mon, tue, etc.)
 */
export function normalizeDayToKey(day: string | number | null | undefined): string | null {
  if (day === null || day === undefined) return null

  const raw = String(day).trim()
  if (!raw) return null

  // If it's a digit 1-7
  if (/^[1-7]$/.test(raw)) {
    const keys: Record<string, string> = {
      '1': 'mon', '2': 'tue', '3': 'wed', '4': 'thu', '5': 'fri', '6': 'sat', '7': 'sun'
    }
    return keys[raw] || null
  }

  const normalized = raw.toLowerCase().replace(/[''ʼ]/g, "'").replace(/[.\s]+/g, '')
  const map: Record<string, string> = {
    monday: 'mon', mon: 'mon', 'понедельник': 'mon', 'понеділок': 'mon', 'пн': 'mon', 'poniedziałek': 'mon', 'pn': 'mon',
    tuesday: 'tue', tue: 'tue', tues: 'tue', 'вторник': 'tue', 'вівторок': 'tue', 'вт': 'tue', 'wtorek': 'tue', 'wt': 'tue',
    wednesday: 'wed', wed: 'wed', 'среда': 'wed', 'середа': 'wed', 'ср': 'wed', 'środa': 'wed', 'śr': 'wed',
    thursday: 'thu', thu: 'thu', thur: 'thu', thurs: 'thu', 'четверг': 'thu', 'четвер': 'thu', 'чт': 'thu', 'czwartek': 'thu', 'czw': 'thu',
    friday: 'fri', fri: 'fri', 'пятница': 'fri', "п'ятниця": 'fri', 'пт': 'fri', 'piątek': 'fri', 'pt': 'fri',
    saturday: 'sat', sat: 'sat', 'суббота': 'sat', 'субота': 'sat', 'сб': 'sat', 'sobota': 'sat', 'sb': 'sat',
    sunday: 'sun', sun: 'sun', 'воскресенье': 'sun', 'неділя': 'sun', 'вс': 'sun', 'нд': 'sun', 'niedziela': 'sun', 'nd': 'sun',
  }

  return map[normalized] ?? null
}
