<template>
  <div class="panel-content">
    <div class="panel-hdr">
      <div>
        <div class="panel-title">{{ $t('financeSettings.usersRoles.title') }}</div>
        <div class="panel-sub">{{ $t('financeSettings.usersRoles.sub') }}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost btn-sm" @click="activeSubTab = 'permissions'">{{ $t('financeSettings.usersRoles.btnPermissions') }}</button>
        <button class="btn btn-primary" @click="showUserModal = true">{{ $t('financeSettings.usersRoles.btnAddUser') }}</button>
      </div>
    </div>

    <!-- SUBTABS -->
    <div class="subtabs-bar">
      <div 
        class="users-tab" 
        :class="{ act: activeSubTab === 'list' }" 
        @click="activeSubTab = 'list'"
      >
        {{ $t('financeSettings.usersRoles.tabList') }}
      </div>
      <div 
        class="users-tab" 
        :class="{ act: activeSubTab === 'permissions' }" 
        @click="activeSubTab = 'permissions'"
      >
        {{ $t('financeSettings.usersRoles.tabPermissions') }}
      </div>
    </div>

    <!-- TAB: LISTA -->
    <div v-if="activeSubTab === 'list'" class="users-list-tab">
      <div class="filters-row">
        <select v-model="filterRole" class="tpl-filter-sel">
          <option value="">{{ $t('financeSettings.usersRoles.filterRoleAll') }}</option>
          <optgroup :label="$t('financeSettings.usersRoles.groupAdmin')">
            <option>Super-Admin</option><option>Admin</option>
          </optgroup>
          <optgroup :label="$t('financeSettings.usersRoles.groupRecruitment')">
            <option>Kierownik działu rekrutacji</option><option>Dział rekrutacji uczniów</option>
          </optgroup>
          <optgroup :label="$t('financeSettings.usersRoles.groupQuality')">
            <option>Kierownik Działu Jakości Space</option><option>Dział Jakości Space</option>
            <option>Kierownik Działu Jakości INDIGO</option><option>Dział Jakości INDIGO</option>
          </optgroup>
          <optgroup :label="$t('financeSettings.usersRoles.groupTrainers')">
            <option>Trener Space Memory</option><option>Trener INDIGO</option>
          </optgroup>
          <optgroup :label="$t('financeSettings.usersRoles.groupFinance')">
            <option>Główna Księgowa</option>
            <option>Pracownik działu finansów i administracji</option>
            <option>Pracownik sekretariatu</option>
          </optgroup>
          <optgroup :label="$t('financeSettings.usersRoles.groupHr')">
            <option>HR</option>
          </optgroup>
        </select>
        <select v-model="filterProj" class="tpl-filter-sel">
          <option value="">{{ $t('financeSettings.usersRoles.filterProjAll') }}</option>
          <option value="space">🚀 Space Memory</option>
          <option value="indigo">🧠 INDIGO / Speedy Mind</option>
          <option value="olimp">🏆 Olimpiada</option>
          <option value="camp">🎓 Warsztaty / Obozy</option>
        </select>
      </div>

      <div class="users-rows">
        <div v-for="u in filteredUsers" :key="u.id" class="user-row">
          <div class="user-ava" :class="u.colorClass">{{ u.initials }}</div>
          <div style="flex:1;">
            <div class="user-name">{{ u.name }}</div>
            <div class="user-meta">{{ u.email }} · {{ getProjLabels(u.projects) }}</div>
          </div>
          <span class="badge" :class="getRoleBadgeClass(u.role)">{{ u.role }}</span>
          <span v-if="u.status === 'online'" class="online-indicator">
            <span class="dot"></span>{{ $t('financeSettings.usersRoles.statusOnline') }}
          </span>
          <div class="user-actions">
            <button class="btn btn-ghost btn-sm" @click="editUser(u)">✏</button>
            <button v-if="u.id !== 'KN'" class="btn btn-sm btn-red" @click="deleteUser(u)">✕</button>
          </div>
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
              <th>S-Admin</th><th>Admin</th><th>Kier.Rekr</th><th>Trener</th><th>Fin/Adm</th><th>Sekr.</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(p, idx) in store.permissionsMatrix" 
              :key="idx"
              :class="{ 'perm-section': p.section }"
            >
              <td :colspan="p.section ? 7 : 1">{{ p.module }}</td>
              <template v-if="!p.section">
                <td>{{ p.roles['S-Admin'] }}</td>
                <td>{{ p.roles['Admin'] }}</td>
                <td>{{ p.roles['Kier.Rekr'] }}</td>
                <td>{{ p.roles['Trener'] }}</td>
                <td>{{ p.roles['Fin/Adm'] }}</td>
                <td>{{ p.roles['Sekr.'] }}</td>
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
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsUsersStore, type User } from '../../../../stores/settingsUsers.store'
import UserModal from './modals/UserModal.vue'

const { t } = useI18n()
const store = useSettingsUsersStore()
const activeSubTab = ref('list')
const filterRole = ref('')
const filterProj = ref('')
const showUserModal = ref(false)
const selectedUserId = ref<string | null>(null)

const filteredUsers = computed(() => {
  return store.users.filter(u => {
    const roleMatch = !filterRole.value || u.role === filterRole.value
    const projMatch = !filterProj.value || u.projects.includes('all') || u.projects.includes(filterProj.value)
    return roleMatch && projMatch
  })
})

function getProjLabels(projs: string[]) {
  if (projs.includes('all')) return t('financeSettings.usersRoles.projAll')
  const map: Record<string, string> = { space: 'Space Memory', indigo: 'INDIGO', olimp: 'Olimpiada', camp: 'Warsztaty' }
  return projs.map(p => map[p] || p).join(', ')
}

function getRoleBadgeClass(role: string) {
  if (role === 'Super-Admin') return 'b-ok'
  if (role.includes('Admin')) return 'b-purple'
  if (role.includes('Kierownik')) return 'b-amber'
  if (role.includes('Dział Jakości') || role.includes('Trener')) return 'b-green'
  return 'b-cyan'
}

function editUser(u: User) {
  selectedUserId.value = u.id
  showUserModal.value = true
}

function closeUserModal() {
  showUserModal.value = false
  selectedUserId.value = null
}

function deleteUser(u: User) {
  if (confirm(t('financeSettings.usersRoles.deleteConfirm', { name: u.name }))) {
    alert(t('financeSettings.usersRoles.toastDeleted'))
  }
}
</script>

<style scoped>
.panel-hdr {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px; flex-wrap: wrap; gap: 10px;
}
.panel-title { font-size: 16px; font-weight: 900; color: var(--white); }
.panel-sub { font-size: 11px; color: var(--dim); margin-top: 2px; }

.subtabs-bar {
  display: flex; gap: 0; border-bottom: 1px solid var(--b); margin-bottom: 16px;
}
.users-tab {
  padding: 10px 16px; font-size: 11.5px; font-weight: 700; color: var(--dim);
  cursor: pointer; transition: all .2s; border-bottom: 2px solid transparent; margin-bottom: -1px;
}
.users-tab:hover { color: var(--white); }
.users-tab.act { color: var(--purple); border-bottom-color: var(--purple); background: rgba(139, 92, 246, 0.05); }

.filters-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.tpl-filter-sel {
  background: rgba(12, 12, 32, 0.8); border: 1px solid var(--b);
  color: var(--white); border-radius: 8px; padding: 8px 12px; font-size: 12px; font-weight: 600;
}

.users-rows { display: flex; flex-direction: column; gap: 8px; }
.user-row {
  background: var(--card); border: 1px solid var(--b);
  border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 14px; transition: all .2s;
}
.user-row:hover { border-color: var(--bh); background: rgba(12,12,36,1); }

.user-ava {
  width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: #fff;
}
.ua-blue { background: var(--blue); }
.ua-purple { background: var(--purple); }
.ua-amber { background: var(--amber); }
.ua-green { background: var(--green); }
.ua-cyan { background: var(--cyan); }

.user-name { font-size: 13px; font-weight: 700; color: var(--white); }
.user-meta { font-size: 10.5px; color: var(--dim); margin-top: 1px; }

.badge { font-size: 9.5px; font-weight: 800; padding: 2px 7px; border-radius: 5px; }
.b-ok { background: rgba(16, 185, 129, 0.12); color: var(--green); border: 1px solid rgba(16, 185, 129, 0.22); }
.b-purple { background: rgba(139,92,246,.12); color: var(--purple); border: 1px solid rgba(139,92,246,.2); }
.b-amber { background: rgba(245,158,11,.12); color: var(--amber); border: 1px solid rgba(245,158,11,.2); }
.b-green { background: rgba(16,185,129,.12); color: var(--green); border: 1px solid rgba(16,185,129,.2); }
.b-cyan { background: rgba(6,182,212,.12); color: var(--cyan); border: 1px solid rgba(6,182,212,.2); }

.online-indicator { font-size: 10px; color: var(--green); display: flex; align-items: center; gap: 4px; }
.online-indicator .dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; }

/* PERMISSIONS */
.perm-table-wrap { overflow-x: auto; }
.perm-tbl { width: 100%; border-collapse: collapse; margin-top: 10px; }
.perm-tbl th {
  padding: 10px 14px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--dim);
  border-bottom: 1px solid var(--b); text-align: center;
}
.perm-tbl th:first-child { text-align: left; }
.perm-tbl td { padding: 8px 14px; font-size: 11.5px; border-bottom: 1px solid rgba(100,120,255,0.06); text-align: center; color: var(--white); }
.perm-tbl td:first-child { text-align: left; font-weight: 500; }
.perm-section { background: rgba(255,255,255,0.02); }
.perm-section td { font-size: 10px; font-weight: 900; color: var(--dim); text-transform: uppercase; padding: 6px 14px; }

.perm-legend { margin-top: 14px; display: flex; gap: 16px; font-size: 10.5px; color: var(--dim); }

.btn-red { background: rgba(239, 68, 68, 0.1); color: var(--red); border: 1px solid rgba(239, 68, 68, 0.2); }
.btn-red:hover { background: rgba(239, 68, 68, 0.2); }
</style>
