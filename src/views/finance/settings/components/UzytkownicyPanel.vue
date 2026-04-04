<template>
  <div class="panel-content">
    <div class="panel-hdr">
      <div>
        <div class="panel-title">{{ $t('financeSettings.usersRoles.title') }}</div>
        <div class="panel-sub">{{ $t('financeSettings.usersRoles.sub') }}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost btn-sm" @click="activeSubTab = 'permissions'">{{ $t('financeSettings.usersRoles.btnPermissions') }}</button>
        <button class="btn btn-primary" @click="openCreate">{{ $t('financeSettings.usersRoles.btnAddUser') }}</button>
      </div>
    </div>

    <!-- SUBTABS -->
    <div class="subtabs-bar">
      <div class="users-tab" :class="{ act: activeSubTab === 'list' }" @click="activeSubTab = 'list'">
        {{ $t('financeSettings.usersRoles.tabList') }}
      </div>
      <div class="users-tab" :class="{ act: activeSubTab === 'permissions' }" @click="activeSubTab = 'permissions'">
        {{ $t('financeSettings.usersRoles.tabPermissions') }}
      </div>
    </div>

    <!-- TAB: LIST -->
    <div v-if="activeSubTab === 'list'" class="users-list-tab">
      <div class="filters-row">
        <!-- Role filter using canonical AppRole keys + i18n labels -->
        <select v-model="filterRole" class="tpl-filter-sel">
          <option value="">{{ $t('financeSettings.usersRoles.filterRoleAll') }}</option>
          <option v-for="role in APP_ROLES" :key="role" :value="role">
            {{ t(`roles.${role}`) }}
          </option>
        </select>
        <select v-model="filterProj" class="tpl-filter-sel">
          <option value="">{{ $t('financeSettings.usersRoles.filterProjAll') }}</option>
          <option value="space">🚀 Space Memory PL</option>
          <option value="indigo">🧠 Indigo</option>
        </select>
        <select v-model="filterStatus" class="tpl-filter-sel">
          <option value="">Все статусы</option>
          <option value="active">{{ $t('financeSettings.usersRoles.statusActive') }}</option>
          <option value="inactive">{{ $t('financeSettings.usersRoles.statusInactive') }}</option>
        </select>
      </div>

      <div class="users-rows">
        <div
          v-for="u in filteredUsers" :key="u.id"
          class="user-row"
          :class="{ inactive: !u.isActive }"
        >
          <div class="user-ava" :class="u.colorClass">{{ u.initials }}</div>
          <div style="flex:1;">
            <div class="user-name">
              {{ u.name }}
              <span v-if="!u.isActive" class="badge b-red">{{ $t('financeSettings.usersRoles.statusInactive') }}</span>
            </div>
            <div class="user-meta">{{ u.email }} · {{ getProjLabels(u.projects) }}</div>
          </div>
          <span class="badge" :class="getRoleBadgeClass(u.role)">{{ t(`roles.${u.role}`) || u.role }}</span>
          <span v-if="u.status === 'online' && u.isActive" class="online-indicator">
            <span class="dot"></span>{{ $t('financeSettings.usersRoles.statusOnline') }}
          </span>
          <div class="user-actions">
            <button class="btn btn-ghost btn-sm" @click="editUser(u)" :title="'Edit'">✏</button>
            <button
              class="btn btn-sm"
              :class="u.isActive ? 'btn-warn' : 'btn-ok'"
              @click="toggleActive(u)"
              :title="u.isActive ? $t('financeSettings.usersRoles.btnDeactivate') : $t('financeSettings.usersRoles.btnActivate')"
            >{{ u.isActive ? '⏸' : '▶' }}</button>
            <button
              v-if="u.id !== authStore.user?.id"
              class="btn btn-sm btn-red"
              @click="deleteUser(u)"
              title="Delete"
            >✕</button>
          </div>
        </div>
        <div v-if="filteredUsers.length === 0" class="empty-state">
          Нет пользователей с выбранными фильтрами
        </div>
      </div>
    </div>

    <!-- TAB: PERMISSIONS -->
    <div v-else class="users-perm-tab">
      <div class="ibox ibox-blue">
        <div class="ibox-icon">ℹ</div>
        <div v-html="$t('financeSettings.usersRoles.infoPermissions')"></div>
      </div>
      <div class="perm-table-wrap">
        <table class="perm-tbl">
          <thead>
            <tr>
              <th style="min-width:180px;">{{ $t('financeSettings.usersRoles.thModule') }}</th>
              <th v-for="role in permCols" :key="role">{{ t(`roles.${role}`) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, idx) in store.permissionsMatrix" :key="idx" :class="{ 'perm-section': p.section }">
              <td :colspan="p.section ? permCols.length + 1 : 1">{{ p.module }}</td>
              <template v-if="!p.section">
                <td v-for="role in permCols" :key="role">{{ p.roles[role] ?? '—' }}</td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="perm-legend">
        <span>{{ $t('financeSettings.usersRoles.legendFull') }}</span>
        <span>{{ $t('financeSettings.usersRoles.legendRead') }}</span>
        <span>{{ $t('financeSettings.usersRoles.legendOwn') }}</span>
        <span>{{ $t('financeSettings.usersRoles.legendNone') }}</span>
      </div>
    </div>

    <UserModal
      v-if="showUserModal"
      :user-id="selectedUserId"
      @close="closeUserModal"
      @saved="store.fetchUsers()"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsUsersStore, type User } from '../../../../stores/settingsUsers.store'
import { useAuthStore } from '../../../../stores/auth.store'
import UserModal from './modals/UserModal.vue'
import type { AppRole } from '../../../../config/roleMenuAccess.config'

const { t } = useI18n()
const store = useSettingsUsersStore()
const authStore = useAuthStore()

const activeSubTab = ref('list')
const filterRole   = ref('')
const filterProj   = ref('')
const filterStatus = ref('')
const showUserModal  = ref(false)
const selectedUserId = ref<string | null>(null)

const APP_ROLES: AppRole[] = [
  'super-admin', 'admin', 'teacher', 'sales', 'quality', 'finance', 'secretariat', 'hr'
]

// Columns shown in the permissions table (short keys matching permissionsMatrix)
const permCols = ['S-Admin', 'Admin', 'Kier.Rekr', 'Trener', 'Fin/Adm', 'Sekr.']

const filteredUsers = computed(() => {
  return store.users.filter(u => {
    const roleMatch   = !filterRole.value   || u.role === filterRole.value
    const projMatch   = !filterProj.value   || u.projects.includes('all') || u.projects.includes(filterProj.value)
    const statusMatch = !filterStatus.value
      || (filterStatus.value === 'active'   &&  u.isActive)
      || (filterStatus.value === 'inactive' && !u.isActive)
    return roleMatch && projMatch && statusMatch
  })
})

function getProjLabels(projs: string[]) {
  if (projs.includes('all')) return t('financeSettings.usersRoles.projAll')
  const map: Record<string, string> = { space: 'Space Memory PL', indigo: 'Indigo' }
  return projs.map(p => map[p] || p).join(', ')
}

function getRoleBadgeClass(role: string): string {
  const map: Record<string, string> = {
    'super-admin':  'b-ok',
    'admin':        'b-purple',
    'teacher':      'b-green',
    'sales':        'b-amber',
    'quality':      'b-cyan',
    'finance':      'b-purple',
    'secretariat':  'b-cyan',
    'hr':           'b-amber',
  }
  return map[role] ?? 'b-cyan'
}

function openCreate() {
  selectedUserId.value = null
  showUserModal.value = true
}

function editUser(u: User) {
  selectedUserId.value = u.id
  showUserModal.value = true
}

function closeUserModal() {
  showUserModal.value = false
  selectedUserId.value = null
}

async function toggleActive(u: User) {
  const key = u.isActive
    ? 'financeSettings.usersRoles.deactivateConfirm'
    : 'financeSettings.usersRoles.activateConfirm'
  if (!confirm(t(key, { name: u.name }))) return
  try {
    await store.updateUser(u.id, { isActive: !u.isActive })
  } catch {
    // error shown by store
  }
}

async function deleteUser(u: User) {
  if (!confirm(t('financeSettings.usersRoles.deleteConfirm', { name: u.name }))) return
  try {
    await store.deleteUser(u.id)
  } catch {
    // error shown by store
  }
}

onMounted(() => {
  store.fetchUsers()
})
</script>

<style scoped>
.panel-hdr {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px; flex-wrap: wrap; gap: 10px;
}
.panel-title { font-size: 16px; font-weight: 900; color: var(--app-text-main); }
.panel-sub { font-size: 11px; color: var(--app-text-dim); margin-top: 2px; }

.subtabs-bar {
  display: flex; border-bottom: 1px solid var(--app-border); margin-bottom: 16px;
}
.users-tab {
  padding: 10px 16px; font-size: 11.5px; font-weight: 700; color: var(--app-text-dim);
  cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all .15s;
}
.users-tab:hover { color: var(--app-text-main); }
.users-tab.act { color: var(--blue); border-bottom-color: var(--blue); background: var(--status-info-bg); }

.filters-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.tpl-filter-sel {
  background: var(--app-surface); border: 1px solid var(--app-border);
  color: var(--app-text-main); border-radius: 8px; padding: 8px 12px; font-size: 12px; font-weight: 600;
}

.users-rows { display: flex; flex-direction: column; gap: 8px; }
.user-row {
  background: var(--app-card); border: 1px solid var(--app-border);
  border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; transition: all .15s;
}
.user-row:hover { border-color: var(--app-border-hi); background: var(--status-info-bg); }
.user-row.inactive { opacity: .55; }

.user-ava {
  width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; color: white; flex-shrink: 0;
}
.ua-blue   { background: var(--blue); }
.ua-purple { background: var(--purple); }
.ua-amber  { background: var(--amber); }
.ua-green  { background: var(--green); }
.ua-cyan   { background: var(--cyan); }

.user-name { font-size: 13px; font-weight: 700; color: var(--app-text-main); display: flex; align-items: center; gap: 6px; }
.user-meta { font-size: 10.5px; color: var(--app-text-dim); margin-top: 1px; }

.badge { font-size: 9.5px; font-weight: 800; padding: 2px 7px; border-radius: 5px; white-space: nowrap; }
.b-ok     { background: rgba(16,185,129,.12);  color: var(--green);  border: 1px solid rgba(16,185,129,.22); }
.b-purple { background: rgba(139,92,246,.12);  color: var(--purple); border: 1px solid rgba(139,92,246,.2); }
.b-amber  { background: rgba(245,158,11,.12);  color: var(--amber);  border: 1px solid rgba(245,158,11,.2); }
.b-green  { background: rgba(16,185,129,.12);  color: var(--green);  border: 1px solid rgba(16,185,129,.2); }
.b-cyan   { background: rgba(6,182,212,.12);   color: var(--cyan);   border: 1px solid rgba(6,182,212,.2); }
.b-red    { background: rgba(239,68,68,.12);   color: #ef4444;       border: 1px solid rgba(239,68,68,.2); }

.online-indicator { font-size: 10px; color: var(--green); display: flex; align-items: center; gap: 4px; white-space: nowrap; }
.online-indicator .dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; }

.user-actions { display: flex; gap: 4px; flex-shrink: 0; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
.btn-sm   { padding: 5px 10px; font-size: 11px; }
.btn-ghost { background: var(--app-surface); color: var(--app-text-dim); border: 1px solid var(--app-border); }
.btn-primary { background: linear-gradient(135deg, #4f6ef7, #8b5cf6); color: #fff; }
.btn-red  { background: rgba(239,68,68,.1);  color: #ef4444; border: 1px solid rgba(239,68,68,.2); }
.btn-red:hover  { background: rgba(239,68,68,.2); }
.btn-warn { background: rgba(245,158,11,.1); color: var(--amber); border: 1px solid rgba(245,158,11,.2); }
.btn-warn:hover { background: rgba(245,158,11,.2); }
.btn-ok   { background: rgba(16,185,129,.1); color: var(--green); border: 1px solid rgba(16,185,129,.2); }
.btn-ok:hover   { background: rgba(16,185,129,.2); }

.empty-state { text-align: center; padding: 32px; color: var(--app-text-dim); font-size: 13px; }

/* PERMISSIONS */
.perm-table-wrap { overflow-x: auto; }
.perm-tbl { width: 100%; border-collapse: collapse; margin-top: 10px; }
.perm-tbl th {
  padding: 10px 14px; font-size: 10px; font-weight: 800; text-transform: uppercase;
  color: var(--app-text-dim); border-bottom: 1px solid var(--app-border); text-align: center;
}
.perm-tbl th:first-child { text-align: left; }
.perm-tbl td { padding: 8px 14px; font-size: 11.5px; border-bottom: 1px solid rgba(100,120,255,0.06); text-align: center; color: var(--app-text-main); }
.perm-tbl td:first-child { text-align: left; font-weight: 500; }
.perm-section { background: rgba(255,255,255,0.02); }
.perm-section td { font-size: 10px; font-weight: 900; color: var(--app-text-dim); text-transform: uppercase; padding: 6px 14px; }
.perm-legend { margin-top: 14px; display: flex; gap: 16px; font-size: 10.5px; color: var(--app-text-dim); flex-wrap: wrap; }

.ibox { display: flex; gap: 10px; padding: 12px 14px; border-radius: 10px; margin-bottom: 16px; font-size: 12px; }
.ibox-blue { background: var(--status-info-bg); border: 1px solid rgba(79,110,247,.2); color: var(--app-text-main); }
.ibox-icon { font-size: 16px; flex-shrink: 0; }
</style>
