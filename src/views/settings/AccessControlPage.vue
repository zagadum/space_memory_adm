<template>
  <div class="ac-page">
    <!-- Шапка -->
    <div class="page-header">
      <div class="header-left">
        <div class="page-icon">🔐</div>
        <div>
          <h1 class="page-title">{{ t('accessControl.title') }}</h1>
          <p class="page-sub">{{ t('accessControl.subtitle') }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'roles' }"
        @click="activeTab = 'roles'"
      >
        🛡 {{ t('accessControl.tabRoles') }}
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        👤 {{ t('accessControl.tabUsers') }}
      </button>
    </div>

    <!-- ═══ TAB 1: Дефолты ролей (read-only) ═══ -->
    <div v-if="activeTab === 'roles'" class="tab-content">
      <div class="info-banner">
        <span class="info-icon">ℹ️</span>
        <span class="info-text">{{ t('accessControl.rolesInfoBanner') }}</span>
      </div>

      <!-- Легенда -->
      <div class="legend">
        <div v-for="st in statusModes" :key="st.mode" class="legend-item">
          <div class="legend-dot" :class="st.mode"></div>
          <span>{{ t(`accessControl.mode.${st.mode}`) }}</span>
        </div>
      </div>

      <!-- Матрица дефолтов (read-only) -->
      <div class="matrix-wrapper">
        <table class="matrix-table">
          <thead>
            <tr>
              <th class="col-section">{{ t('accessControl.colSection') }}</th>
              <th v-for="role in ROLES" :key="role" class="col-role">
                <div class="role-header">
                  <span class="role-emoji">{{ roleEmoji(role) }}</span>
                  <span class="role-name">{{ t(`accessControl.role.${role}`) }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="section in SECTIONS" :key="section.key">
              <tr class="section-row">
                <td :colspan="ROLES.length + 1" class="section-label">
                  {{ section.icon }} {{ t(`accessControl.section.${section.key}`, section.key) }}
                </td>
              </tr>
              <tr v-for="item in section.items" :key="item.key" class="item-row">
                <td class="col-item">
                  <span class="item-name">{{ t(`accessControl.item.${item.key}`, item.key) }}</span>
                </td>
                <td
                  v-for="role in ROLES"
                  :key="role"
                  class="col-cell"
                  :title="t(`accessControl.mode.${getDefaultMode(role, item.key)}`)"
                >
                  <div class="cell-dot" :class="getDefaultMode(role, item.key)">
                    <span class="cell-icon">{{ modeIcon(getDefaultMode(role, item.key)) }}</span>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══ TAB 2: Пользователи ═══ -->
    <div v-if="activeTab === 'users'" class="tab-content">
      <div class="info-banner">
        <span class="info-icon">👤</span>
        <span class="info-text">{{ t('accessControl.usersInfoBanner') }}</span>
      </div>

      <!-- Поиск -->
      <div class="search-bar">
        <input
          v-model="userSearch"
          type="text"
          class="search-input"
          :placeholder="t('accessControl.searchUsers')"
        />
      </div>

      <!-- Загрузка -->
      <div v-if="usersLoading" class="loading-state">
        ⏳ {{ t('accessControl.loadingUsers') }}
      </div>

      <!-- Список пользователей -->
      <div v-else class="users-list">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-card"
          :class="{ selected: selectedUser?.id === user.id }"
          @click="selectUser(user)"
        >
          <div class="user-avatar">{{ userInitials(user.name) }}</div>
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-email">{{ user.email }}</div>
          </div>
          <div class="user-role-badge" :class="user.role">
            {{ roleEmoji(user.role as AppRole) }} {{ t(`accessControl.role.${user.role}`) }}
          </div>
          <div class="user-overrides-count" v-if="Object.keys(user.overrides).length > 0">
            <span class="overrides-badge">
              {{ Object.keys(user.overrides).length }} {{ t('accessControl.overridesCount') }}
            </span>
          </div>
          <span class="user-arrow">›</span>
        </div>
      </div>
    </div>

    <!-- ═══ Slide-out панель для overrides ═══ -->
    <transition name="slide">
      <div v-if="selectedUser" class="override-panel">
        <div class="panel-header">
          <div class="panel-user">
            <div class="panel-avatar">{{ userInitials(selectedUser.name) }}</div>
            <div>
              <div class="panel-name">{{ selectedUser.name }}</div>
              <div class="panel-email">{{ selectedUser.email }}</div>
              <div class="panel-role">
                {{ roleEmoji(selectedUser.role as AppRole) }}
                {{ t(`accessControl.role.${selectedUser.role}`) }}
              </div>
            </div>
          </div>
          <button class="panel-close" @click="selectedUser = null">✕</button>
        </div>

        <div class="panel-body">
          <!-- Секции -->
          <template v-for="section in SECTIONS" :key="section.key">
            <div class="override-section-title">
              {{ section.icon }} {{ t(`accessControl.section.${section.key}`, section.key) }}
            </div>
            <div
              v-for="item in section.items"
              :key="item.key"
              class="override-row"
            >
              <div class="override-label">
                {{ t(`accessControl.item.${item.key}`, item.key) }}
              </div>
              <div class="override-status">
                <!-- Дефолт роли -->
                <span class="default-mode-tag" :class="getDefaultMode(selectedUser.role as AppRole, item.key)">
                  {{ t('accessControl.roleDefault') }}: {{ t(`accessControl.mode.${getDefaultMode(selectedUser.role as AppRole, item.key)}`) }}
                </span>
              </div>
              <div class="override-actions">
                <button
                  class="override-btn grant"
                  :class="{ active: editOverrides[item.key] === 'active' }"
                  @click="toggleOverride(item.key, 'active')"
                  :title="t('accessControl.grantAccess')"
                >
                  ✓
                </button>
                <button
                  class="override-btn revoke"
                  :class="{ active: editOverrides[item.key] === 'hidden' }"
                  @click="toggleOverride(item.key, 'hidden')"
                  :title="t('accessControl.revokeAccess')"
                >
                  ✕
                </button>
                <button
                  v-if="editOverrides[item.key]"
                  class="override-btn reset"
                  @click="clearOverride(item.key)"
                  :title="t('accessControl.resetToDefault')"
                >
                  ↺
                </button>
              </div>
            </div>
          </template>
        </div>

        <div class="panel-footer">
          <button class="btn-cancel" @click="selectedUser = null">
            {{ t('accessControl.cancel') }}
          </button>
          <button class="btn-save" :disabled="saving" @click="saveOverrides">
            {{ saving ? '⏳' : '💾' }} {{ t('accessControl.save') }}
          </button>
        </div>
      </div>
    </transition>

    <!-- Overlay -->
    <transition name="fade">
      <div v-if="selectedUser" class="overlay" @click="selectedUser = null"></div>
    </transition>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" class="ac-toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { accessControlApi, type AccessMode, type UserEntry } from '../../api/accessControlApi'
import { ROLE_MENU_ACCESS, type AppRole } from '../../config/roleMenuAccess.config'

const { t } = useI18n()

// ─── Tabs ────────────────────────────────────────────────────────────────────
const activeTab = ref<'roles' | 'users'>('users')

// ─── Роли (порядок колонок) ──────────────────────────────────────────────────
const ROLES: AppRole[] = ['super-admin', 'admin', 'teacher', 'sales', 'quality', 'finance', 'secretariat', 'hr']

// ─── Секции матрицы ──────────────────────────────────────────────────────────
const SECTIONS = [
  {
    key: 'common',
    icon: '🧭',
    items: [
      { key: 'dashboard' },
      { key: 'my-cabinet' },
    ],
  },
  {
    key: 'secretariat',
    icon: '🗂',
    items: [
      { key: 'secretariat' },
      { key: 'students' },
      { key: 'groups' },
      { key: 'teachers' },
      { key: 'course-endings' },
    ],
  },
  {
    key: 'recruitment',
    icon: '📋',
    items: [
      { key: 'recruitment' },
      { key: 'new-students' },
      { key: 'leads' },
      { key: 'target-mail' },
      { key: 'expelled' },
      { key: 'new-groups' },
      { key: 'archived' },
      { key: 'import-db' },
      { key: 'import-db-update' },
      { key: 'import-db-delete' },
      { key: 'import-db-resend-invitation' },
    ],
  },
  {
    key: 'finance',
    icon: '💳',
    items: [
      { key: 'finance' },
      { key: 'student-finance' },
      { key: 'debtors' },
      { key: 'nadplaty' },
      { key: 'settings' },
      { key: 'accounting' },
      { key: 'faktury' },
      { key: 'returns' },
      { key: 'projects' },
      { key: 'salary-calculator' },
      { key: 'finance-ustawienia' },
    ],
  },
  {
    key: 'trainer',
    icon: '🎓',
    items: [
      { key: 'trainer' },
      { key: 'trainer-dashboard' },
      { key: 'trainer-students' },
      { key: 'trainer-groups' },
      { key: 'lesson-tracker' },
      { key: 'salary-demo' },
      { key: 'trainer-materials' },
      { key: 'trainer-exam' },
      { key: 'trainer-mail' },
    ],
  },
  {
    key: 'quality',
    icon: '🔎',
    items: [
      { key: 'quality' },
      { key: 'rezygnacje' },
      { key: 'holidays-return' },
      { key: 'quality-monitoring' },
      { key: 'quality-analytics' },
      { key: 'trial-lessons-qd' },
      { key: 'quality-zaliczenia' },
      { key: 'quality-olimpiad' },
      { key: 'spotkania' },
      { key: 'sciezka' },
      { key: 'quality-materials' },
      { key: 'zaliczenia-calendar' },
      { key: 'all-tasks' },
      { key: 'quality-stats' },
    ],
  },
  {
    key: 'hr',
    icon: '🧑',
    items: [
      { key: 'hr' },
      { key: 'hr-active' },
      { key: 'hr-training' },
      { key: 'hr-pipeline' },
      { key: 'hr-personal' },
      { key: 'hr-analytics' },
    ],
  },
  {
    key: 'settings',
    icon: '⚙',
    items: [
      { key: 'settings-section' },
      { key: 'access-control' },
      { key: 'integrations' },
      { key: 'reports' },
    ],
  },
]

// ─── Режимы ──────────────────────────────────────────────────────────────────
const statusModes: { mode: AccessMode }[] = [
  { mode: 'active' },
  { mode: 'read-only' },
  { mode: 'hidden' },
]

// ─── Хелперы ─────────────────────────────────────────────────────────────────
function getDefaultMode(role: AppRole, key: string): AccessMode {
  const entry = ROLE_MENU_ACCESS[role]?.[key]
  return entry?.mode === 'active' ? 'active' : 'hidden'
}

function modeIcon(mode: AccessMode): string {
  return mode === 'active' ? '✓' : mode === 'read-only' ? '👁' : '—'
}

function roleEmoji(role: AppRole): string {
  const map: Record<AppRole, string> = {
    'super-admin': '👑', admin: '🛡', teacher: '📚', sales: '📣',
    quality: '🔍', finance: '💰', secretariat: '📁', hr: '👤',
  }
  return map[role] ?? '👤'
}

function userInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
}

// ─── Users state ─────────────────────────────────────────────────────────────
const users = ref<UserEntry[]>([])
const usersLoading = ref(false)
const userSearch = ref('')
const selectedUser = ref<UserEntry | null>(null)
const editOverrides = reactive<Record<string, AccessMode>>({})
const saving = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const q = userSearch.value.toLowerCase()
  return users.value.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.role.toLowerCase().includes(q)
  )
})

// ─── Load users ──────────────────────────────────────────────────────────────
async function loadUsers() {
  usersLoading.value = true
  try {
    const data = await accessControlApi.getUsersList()
    users.value = data.items
  } catch {
    showToast(t('accessControl.savedError'), 'error')
  } finally {
    usersLoading.value = false
  }
}

// ─── Select user → open panel ────────────────────────────────────────────────
function selectUser(user: UserEntry) {
  selectedUser.value = user
  // Populate edit overrides from existing user overrides
  const keys = Object.keys(editOverrides)
  keys.forEach(k => delete editOverrides[k])
  if (user.overrides) {
    Object.assign(editOverrides, { ...user.overrides })
  }
}

// ─── Override toggle logic ───────────────────────────────────────────────────
function toggleOverride(key: string, mode: AccessMode) {
  if (editOverrides[key] === mode) {
    // Toggle off = reset to role default
    delete editOverrides[key]
  } else {
    editOverrides[key] = mode
  }
}

function clearOverride(key: string) {
  delete editOverrides[key]
}

// ─── Save overrides ──────────────────────────────────────────────────────────
async function saveOverrides() {
  if (!selectedUser.value) return
  saving.value = true
  try {
    const payload = JSON.parse(JSON.stringify(editOverrides))
    await accessControlApi.saveUserOverrides(selectedUser.value.id, payload)
    // Update local state
    const user = users.value.find(u => u.id === selectedUser.value!.id)
    if (user) user.overrides = { ...payload }
    showToast(t('accessControl.savedOk'), 'success')
    selectedUser.value = null
  } catch {
    showToast(t('accessControl.savedError'), 'error')
  } finally {
    saving.value = false
  }
}

function showToast(message: string, type: 'success' | 'error') {
  toast.value = { message, type }
  setTimeout(() => { toast.value = null }, 3000)
}

// ─── Init ────────────────────────────────────────────────────────────────────
onMounted(() => {
  loadUsers()
})

// Reload users when switching to users tab
watch(activeTab, (tab) => {
  if (tab === 'users' && !users.value.length) loadUsers()
})
</script>

<style scoped>
.ac-page {
  padding: 24px 28px;
  max-width: 1200px;
  position: relative;
}

/* ── Шапка ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-icon { font-size: 36px; line-height: 1; }

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--app-text-main);
  margin: 0 0 4px;
}

.page-sub {
  font-size: 13px;
  color: var(--app-text-dim);
  margin: 0;
}

/* ── Tabs ── */
.tabs-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: var(--app-text-dim);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover { background: rgba(79, 110, 247, 0.06); color: var(--app-text-main); }
.tab-btn.active {
  background: linear-gradient(135deg, rgba(79, 110, 247, 0.12), rgba(139, 92, 246, 0.12));
  color: var(--app-text-main);
  box-shadow: 0 2px 8px rgba(79, 110, 247, 0.15);
}

/* ── Info Banner ── */
.info-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(79, 110, 247, 0.07);
  border: 1px solid rgba(79, 110, 247, 0.2);
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 13px;
}
.info-text { flex: 1; color: var(--app-text-dim); }

/* ── Legend ── */
.legend {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--app-text-dim);
}

.legend-dot {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* ── Matrix ── */
.matrix-wrapper {
  overflow-x: auto;
  border-radius: 14px;
  border: 1px solid var(--app-border);
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}

.matrix-table thead {
  background: var(--app-surface);
  position: sticky;
  top: 0;
  z-index: 2;
}

.col-section {
  padding: 12px 16px;
  text-align: left;
  font-weight: 700;
  font-size: 11px;
  color: var(--app-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  width: 200px;
  border-bottom: 1px solid var(--app-border);
}

.col-role {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid var(--app-border);
  width: 92px;
}

.role-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.role-emoji { font-size: 16px; }
.role-name  { font-size: 10px; font-weight: 700; color: var(--app-text-dim); white-space: nowrap; }

.section-row { background: var(--app-surface); }

.section-label {
  padding: 9px 16px;
  font-size: 11px;
  font-weight: 700;
  color: var(--app-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-top: 1px solid var(--app-border);
  border-bottom: 1px solid rgba(100, 120, 255, 0.07);
}

.item-row { border-bottom: 1px solid rgba(100, 120, 255, 0.06); }
.item-row:last-child { border-bottom: none; }
.item-row:hover { background: rgba(79, 110, 247, 0.03); }

.col-item {
  padding: 10px 16px;
  color: var(--app-text-main);
}

.item-name { font-size: 12.5px; font-weight: 500; }

.col-cell {
  text-align: center;
  padding: 8px 4px;
}

.cell-dot {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.15s;
  border: 1px solid transparent;
}

/* Статусы */
.cell-dot.active {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.35);
  color: #10b981;
}

.cell-dot.read-only {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.cell-dot.hidden {
  background: rgba(136, 146, 176, 0.08);
  border-color: rgba(136, 146, 176, 0.2);
  color: var(--app-text-dim);
  opacity: 0.5;
}

.legend-dot.active    { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); color: #10b981; }
.legend-dot.read-only { background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3);  color: #f59e0b; }
.legend-dot.hidden    { background: rgba(136, 146, 176, 0.08); border: 1px solid rgba(136, 146, 176, 0.2); color: var(--app-text-dim); }

/* ══════════════════════════════════════════════════════════════════════════ */
/* USERS TAB                                                                */
/* ══════════════════════════════════════════════════════════════════════════ */

.search-bar {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid var(--app-border);
  border-radius: 10px;
  background: var(--app-surface);
  color: var(--app-text-main);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus {
  border-color: rgba(79, 110, 247, 0.5);
}
.search-input::placeholder {
  color: var(--app-text-dim);
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--app-text-dim);
  font-size: 14px;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  background: var(--app-surface);
  cursor: pointer;
  transition: all 0.2s;
}
.user-card:hover {
  border-color: rgba(79, 110, 247, 0.35);
  background: rgba(79, 110, 247, 0.04);
}
.user-card.selected {
  border-color: rgba(79, 110, 247, 0.5);
  background: rgba(79, 110, 247, 0.07);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(79, 110, 247, 0.15), rgba(139, 92, 246, 0.15));
  color: var(--app-text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text-main);
}

.user-email {
  font-size: 11.5px;
  color: var(--app-text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  background: rgba(79, 110, 247, 0.1);
  color: var(--app-text-dim);
}

.overrides-badge {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  white-space: nowrap;
}

.user-arrow {
  font-size: 14px;
  color: var(--app-text-dim);
  flex-shrink: 0;
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* OVERRIDE PANEL (Slide-out)                                               */
/* ══════════════════════════════════════════════════════════════════════════ */

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 998;
}

.override-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 520px;
  max-width: 90vw;
  background: var(--app-bg, #0f1117);
  border-left: 1px solid var(--app-border);
  z-index: 999;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.3);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--app-border);
  flex-shrink: 0;
}

.panel-user {
  display: flex;
  align-items: center;
  gap: 14px;
}

.panel-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4f6ef7, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.panel-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--app-text-main);
}

.panel-email {
  font-size: 12px;
  color: var(--app-text-dim);
}

.panel-role {
  font-size: 11px;
  color: var(--app-text-dim);
  margin-top: 2px;
}

.panel-close {
  width: 32px;
  height: 32px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-surface);
  color: var(--app-text-dim);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.panel-close:hover {
  border-color: var(--app-border-hi);
  color: var(--app-text-main);
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.override-section-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--app-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 16px;
  margin-bottom: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(100, 120, 255, 0.08);
}

.override-section-title:first-child {
  margin-top: 0;
}

.override-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(100, 120, 255, 0.04);
}

.override-label {
  flex: 1;
  font-size: 12.5px;
  color: var(--app-text-main);
  font-weight: 500;
}

.override-status {
  flex-shrink: 0;
}

.default-mode-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
  white-space: nowrap;
}

.default-mode-tag.active {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.default-mode-tag.hidden {
  background: rgba(136, 146, 176, 0.08);
  color: var(--app-text-dim);
}

.override-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.override-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-dim);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.override-btn:hover { border-color: var(--app-border-hi); }

.override-btn.grant.active {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.4);
  color: #10b981;
}

.override-btn.revoke.active {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.override-btn.reset {
  color: var(--app-text-dim);
  font-size: 11px;
}
.override-btn.reset:hover {
  color: #f59e0b;
}

.panel-footer {
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--app-border);
  flex-shrink: 0;
}

.btn-cancel {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-dim);
  transition: all 0.2s;
}
.btn-cancel:hover { border-color: var(--app-border-hi); color: var(--app-text-main); }

.btn-save {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: linear-gradient(135deg, #4f6ef7, #8b5cf6);
  color: #fff;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(79, 110, 247, 0.3);
}
.btn-save:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(79, 110, 247, 0.5); transform: translateY(-1px); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Transitions ── */
.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Toast ── */
.ac-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 22px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13.5px;
  z-index: 9999;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.ac-toast.success { background: rgba(16, 185, 129, 0.9); color: #fff; }
.ac-toast.error   { background: rgba(239, 68, 68, 0.9);  color: #fff; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateY(16px); }
</style>
