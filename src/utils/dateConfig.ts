import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// единый часовой пояс Варшавы для школы
// Если нужен будет UTC, можно изменить на 'UTC'
export const APP_TIMEZONE = import.meta.env.VITE_APP_TIMEZONE || 'Europe/Warsaw'
dayjs.tz.setDefault(APP_TIMEZONE)

/**
 * Парсит любую дату (строку или Date) с учетом 글로벌ного часового пояса
 */
export function parseDate(dateStr: string | Date | undefined | null) {
  if (!dateStr) return dayjs().tz(APP_TIMEZONE)
  return dayjs(dateStr).tz(APP_TIMEZONE)
}

/**
 * Форматирует дату с учетом тайм-зоны
 * По умолчанию формат: 'YYYY-MM-DD' для календарей и инпутов
 */
export function formatDate(dateStr: string | Date | undefined | null, format = 'YYYY-MM-DD') {
  if (!dateStr) return ''
  return parseDate(dateStr).format(format)
}

/**
 * Возвращает текущую общую дату на проекте
 */
export function appNow() {
  return dayjs().tz(APP_TIMEZONE)
}
