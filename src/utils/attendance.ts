/**
 * Нормализует значение посещаемости к каноническому коду.
 *
 * До введения канонических кодов ('present'/'absent'/'future') модалка
 * сохраняла переведённую строку из активной локали. Эта функция
 * приводит любой legacy-вариант к единому коду.
 */

const PRESENT_VARIANTS = new Set([
  'present',
  'Присутствовал', '✅ Присутствовал',   // ru
  'Присутній',     '✅ Присутній',        // uk
  'Obecny',        '✅ Obecny',           // pl
  'Present',       '✅ Present',          // en
]);

const ABSENT_VARIANTS = new Set([
  'absent',
  'Отсутствовал',  '❌ Отсутствовал',    // ru
  'Відсутній',     '❌ Відсутній',        // uk
  'Nieobecny',     '❌ Nieobecny',        // pl
  'Absent',        '❌ Absent',           // en
]);

const FUTURE_VARIANTS = new Set([
  'future',
  'Будет',   // ru
  'Буде',    // uk
  'Będzie',  // pl
  'Upcoming', // en
]);

export type AttendanceCode = 'present' | 'absent' | 'future' | '';

export function normalizeAttendance(val: string | undefined | null): AttendanceCode {
  if (!val) return '';
  if (PRESENT_VARIANTS.has(val)) return 'present';
  if (ABSENT_VARIANTS.has(val))  return 'absent';
  if (FUTURE_VARIANTS.has(val))  return 'future';
  return '';
}
