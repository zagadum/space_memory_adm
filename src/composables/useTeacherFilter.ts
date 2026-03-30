import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.store'
import { normalizeRole, type AppRole } from '../config/roleMenuAccess.config'

/**
 * Composable для фильтрации данных по teacherId.
 *
 * Использование в store:
 *   const { isTeacher, teacherId } = useTeacherFilter()
 *   if (isTeacher.value && teacherId.value) {
 *     params.teacherId = teacherId.value
 *   }
 *
 * Возвращает:
 *   isTeacher — true если текущий пользователь имеет роль teacher
 *   teacherId — числовой ID преподавателя (или null)
 */
export function useTeacherFilter() {
  const authStore = useAuthStore()

  const isTeacher = computed<boolean>(() =>
    normalizeRole(authStore.user?.role) === 'teacher'
  )

  const teacherId = computed<number | null>(() =>
    isTeacher.value ? (authStore.user?.teacherId ?? null) : null
  )

  return {
    isTeacher,
    teacherId,
  }
}
