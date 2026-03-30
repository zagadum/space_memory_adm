import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.store'
import { normalizeRole, ROLE_MENU_ACCESS, type AppRole } from '../config/roleMenuAccess.config'
import { isMenuAllowed } from '../utils/menuAccess'

/**
 * Composable для компонентного контроля доступа.
 *
 * Использование:
 *   const { isRole, canAccess, role } = useCanAccess()
 *
 *   // Скрыть кнопку "Удалить студента":
 *   v-if="isRole('admin', 'super-admin')"
 *
 *   // Скрыть секцию меню:
 *   v-if="canAccess('finance')"
 */
export function useCanAccess() {
  const authStore = useAuthStore()

  /** Нормализованная роль текущего пользователя (или null) */
  const role = computed<AppRole | null>(() =>
    normalizeRole(authStore.user?.role)
  )

  /**
   * Проверяет, является ли текущая роль одной из указанных.
   * Используйте для скрытия/показа кнопок и полей.
   *
   * @example isRole('admin', 'super-admin')
   */
  function isRole(...roles: AppRole[]): boolean {
    if (!role.value) return false
    return roles.includes(role.value)
  }

  /**
   * Проверяет доступ к ключу меню из ROLE_MENU_ACCESS.
   * Используйте для скрытия целых секций.
   *
   * @example canAccess('finance')
   */
  function canAccess(menuKey: string): boolean {
    return isMenuAllowed(menuKey)
  }

  /**
   * Возвращает true если пользователь НЕ является ни одной из указанных ролей.
   * Удобно для UI: скрыть финансы от учителя.
   *
   * @example hideFor('teacher', 'sales')
   */
  function hideFor(...roles: AppRole[]): boolean {
    if (!role.value) return true
    return !roles.includes(role.value)
  }

  /**
   * Проверяет, входит ли текущая роль в указанный массив ролей.
   * Возвращает обычный boolean (не reactive) — используйте в computed или сразу в v-if.
   *
   * @example const canDelete = computed(() => canAny(['admin', 'super-admin']))
   */
  function canAny(roles: AppRole[]): boolean {
    if (!role.value) return false
    return roles.includes(role.value)
  }

  return {
    role,
    isRole,
    canAny,
    canAccess,
    hideFor,
  }
}
