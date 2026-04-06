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
      <div class="header-actions">
        <button class="btn-reset" @click="resetToDefaults">
          ↺ {{ t('accessControl.resetDefaults') }}
        </button>
        <button class="btn-save" :class="{ saving }" @click="saveMatrix" :disabled="saving">
          {{ saving ? '⏳' : '💾' }} {{ t('accessControl.save') }}
        </button>
      </div>
    </div>

    <!-- Инфо-баннер -->
    <div class="info-banner">
      <span class="info-icon">ℹ️</span>
      <span class="info-text">{{ t('accessControl.infoBanner') }}</span>
      <span class="info-contract" @click="showApiContract = !showApiContract">
        {{ t('accessControl.apiContractToggle') }} ▾
      </span>
    </div>

    <!-- API Contract (для разработчика) -->
    <div v-if="showApiContract" class="api-contract">
      <div class="contract-title">📋 API Contract — POST /v1/settings/access-control</div>
      <pre class="contract-code">{{ apiContractExample }}</pre>
    </div>

    <!-- Легенда -->
    <div class="legend">
      <div v-for="st in statusModes" :key="st.mode" class="legend-item">
        <div class="legend-dot" :class="st.mode"></div>
        <span>{{ t(`accessControl.mode.${st.mode}`) }}</span>
      </div>
    </div>

    <!-- Матрица прав -->
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
            <!-- Группа-заголовок -->
            <tr class="section-row">
              <td :colspan="ROLES.length + 1" class="section-label">
                {{ section.icon }} {{ t(`accessControl.section.${section.key}`, section.key) }}
              </td>
            </tr>
            <!-- Строки секции -->
            <tr v-for="item in section.items" :key="item.key" class="item-row">
              <td class="col-item">
                <span class="item-name">{{ t(`accessControl.item.${item.key}`, item.key) }}</span>
              </td>
              <td
                v-for="role in ROLES"
                :key="role"
                class="col-cell"
                :title="t(`accessControl.mode.${getMode(role, item.key)}`)"
                @click="cycleMode(role, item.key)"
              >
                <div class="cell-dot" :class="getMode(role, item.key)">
                  <span class="cell-icon">{{ modeIcon(getMode(role, item.key)) }}</span>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" class="ac-toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { accessControlApi, type RoleMatrix } from '../../api/accessControlApi'
import { ROLE_MENU_ACCESS } from '../../config/roleMenuAccess.config'

const { t } = useI18n()

// ─── Типы ───────────────────────────────────────────────────────────────────
type AppRole = 'super-admin' | 'admin' | 'teacher' | 'sales' | 'quality' | 'finance' | 'secretariat' | 'hr'
type AccessMode = 'active' | 'read-only' | 'hidden'

interface MatrixRow { [role: string]: AccessMode }
interface Matrix extends RoleMatrix {}

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

const CYCLE_ORDER: AccessMode[] = ['active', 'read-only', 'hidden']

// ─── Умолчания матрицы ───────────────────────────────────────────────────────
function buildDefaults(): Matrix {
  const m: Matrix = {}

  const readonlyByRole: Partial<Record<AppRole, string[]>> = {
    teacher: ['students', 'groups'],
    sales: ['students', 'groups'],
    quality: ['students', 'groups'],
    finance: ['students'],
  }

  const resourceKeys = Array.from(new Set(SECTIONS.flatMap((section) => section.items.map((item) => item.key))))

  for (const resourceKey of resourceKeys) {
    m[resourceKey] = {}
    for (const role of ROLES) {
      const isActive = ROLE_MENU_ACCESS[role]?.[resourceKey]?.mode === 'active'
      if (!isActive) {
        m[resourceKey][role] = 'hidden'
        continue
      }
      const roleReadOnlyKeys = readonlyByRole[role] ?? []
      m[resourceKey][role] = roleReadOnlyKeys.includes(resourceKey) ? 'read-only' : 'active'
    }
  }

  return m
}

// ─── Состояние ───────────────────────────────────────────────────────────────
const matrix = reactive<Matrix>(buildDefaults())
const version = ref(0)
const saving = ref(false)
const showApiContract = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

function applyMatrix(next: Matrix) {
  const nextKeys = new Set(Object.keys(next))
  for (const key of Object.keys(matrix)) {
    if (!nextKeys.has(key)) delete matrix[key]
  }
  for (const key of nextKeys) {
    matrix[key] = next[key]
  }
}

async function loadMatrixFromApi() {
  try {
    const data = await accessControlApi.getAccessMatrix()
    applyMatrix((data?.matrix as Matrix) || buildDefaults())
    version.value = Number(data?.version || 0)
  } catch {
    applyMatrix(buildDefaults())
    version.value = 0
    showToast(t('accessControl.savedError'), 'error')
  }
}

// ─── Хелперы ─────────────────────────────────────────────────────────────────
function getMode(role: AppRole, key: string): AccessMode {
  return matrix[key]?.[role] ?? 'hidden'
}

function cycleMode(role: AppRole, key: string) {
  // Super-Admin всегда active — нельзя изменить
  if (role === 'super-admin') return
  const cur  = getMode(role, key)
  const next = CYCLE_ORDER[(CYCLE_ORDER.indexOf(cur) + 1) % CYCLE_ORDER.length]
  if (!matrix[key]) matrix[key] = {}
  matrix[key][role] = next
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

// ─── Сохранение / сброс ──────────────────────────────────────────────────────
async function saveMatrix() {
  saving.value = true
  try {
    const payload = JSON.parse(JSON.stringify(matrix)) as Matrix
    const res = await accessControlApi.saveAccessMatrix({ matrix: payload, version: version.value })
    version.value = Number(res?.version || version.value)

    showToast(t('accessControl.savedOk'), 'success')
  } catch {
    showToast(t('accessControl.savedError'), 'error')
  } finally {
    saving.value = false
  }
}

function resetToDefaults() {
  applyMatrix(buildDefaults())
  showToast(t('accessControl.resetOk'), 'success')
}

function showToast(message: string, type: 'success' | 'error') {
  toast.value = { message, type }
  setTimeout(() => { toast.value = null }, 3000)
}

// ─── API Contract (для разработчика) ─────────────────────────────────────────
const apiContractExample = `GET /v1/me/access-control
Authorization: Bearer <token>

Response 200:
{
  "role": "finance",
  "version": 12,
  "matrix": {
    "dashboard": "active",
    "students": "read-only",
    "settings": "hidden"
  }
}

POST /v1/settings/access-control
Authorization: Bearer <token>   (super-admin only)
Content-Type: application/json

{
  "matrix": {
    "students": { "super-admin": "active", "admin": "active", "finance": "read-only", ... },
    "groups":   { "super-admin": "active", "admin": "active", "sales": "read-only", ... },
    "reports":  { "super-admin": "active", "admin": "hidden", ... }
  }
}

Response 200:
{ "ok": true, "version": 13, "savedAt": "2026-03-30T18:00:00Z" }

Режимы:
  "active"    — полный доступ + редактирование
  "read-only" — только просмотр (UI отключает кнопки мутации)
  "hidden"    — не видно в меню и недоступно через роут`

onMounted(() => {
  loadMatrixFromApi()
})
</script>

<style scoped>
.ac-page {
  padding: 24px 28px;
  max-width: 1100px;
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

.header-actions { display: flex; gap: 10px; align-items: center; }

.btn-reset {
  padding: 8px 18px;
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
.btn-reset:hover { border-color: var(--app-border-hi); color: var(--app-text-main); }

.btn-save {
  padding: 8px 20px;
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

/* ── Инфо-баннер ── */
.info-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(79, 110, 247, 0.07);
  border: 1px solid rgba(79, 110, 247, 0.2);
  border-radius: 12px;
  margin-bottom: 14px;
  font-size: 13px;
}

.info-text { flex: 1; color: var(--app-text-dim); }

.info-contract {
  cursor: pointer;
  color: var(--blue);
  font-weight: 600;
  white-space: nowrap;
  font-size: 12px;
  transition: opacity 0.15s;
}
.info-contract:hover { opacity: 0.75; }

/* ── API Contract ── */
.api-contract {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.contract-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--app-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 10px;
}

.contract-code {
  font-family: 'Space Mono', monospace;
  font-size: 11.5px;
  color: #10b981;
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
  max-height: 280px;
  overflow-y: auto;
}

/* ── Легенда ── */
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

/* ── Матрица ── */
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

/* Заголовок */
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

/* Строка-разделитель секции */
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

/* Строка данных */
.item-row { border-bottom: 1px solid rgba(100, 120, 255, 0.06); }
.item-row:last-child { border-bottom: none; }
.item-row:hover { background: rgba(79, 110, 247, 0.03); }

.col-item {
  padding: 10px 16px;
  color: var(--app-text-main);
}

.item-name { font-size: 12.5px; font-weight: 500; }

/* Ячейка матрицы */
.col-cell {
  text-align: center;
  padding: 8px 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.col-cell:hover { background: rgba(79, 110, 247, 0.06); }

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
