<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useArchivedStudentsStore } from '../../stores/archivedStudents.store';
import { type ArchivedStudent } from '../../api/archivedStudents.api';
import UiButton from '../../components/ui/UiButton.vue';
import UiInput from '../../components/ui/UiInput.vue';
import UiBadge from '../../components/ui/UiBadge.vue';
import { useAuthStore } from '../../stores/auth.store';
import { useNotificationStore } from '../../stores/notification.store';

const { t } = useI18n();
const archivedStore = useArchivedStudentsStore();
const authStore = useAuthStore();
const notif = useNotificationStore();

// --- CONSTANTS ---
const MANAGER_COLORS: Record<string, string> = {
  'Светлана': 'linear-gradient(135deg, #f59e0b, #f97316)',
  'Александр': 'linear-gradient(135deg, #3b82f6, #2563eb)',
  'Мария': 'linear-gradient(135deg, #10b981, #059669)',
  'Артём': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
};

const REASONS = [
  'Не актуально',
  'Не дозвонились 3 раза',
  'Переехал',
  'Выбрал другую школу',
  'Другое'
];

const GROUPS = [
  { id: 1, name: 'Вт 17 КЛе Младшая', teacher: 'КЛе', slots: 3, color: '#4f6ef7' },
  { id: 2, name: 'Ср 15 ПИе Младшая', teacher: 'ПИе', slots: 1, color: '#8b5cf6' },
  { id: 3, name: 'Пт 19 АНа Старшая', teacher: 'АНа', slots: 0, color: '#06b6d4' },
  { id: 4, name: 'Чт 18 МАр Средняя', teacher: 'МАр', slots: 4, color: '#10b981' },
];

// --- STATE ---
const searchQ = ref('');
const chips = ref({ mine: false, noManager: false });
const managerFilter = ref('all');
const reasonFilter = ref('all');
const openDf = ref<string | null>(null);
const openActions = ref<number | null>(null);

const isInfoOpen = ref(false); // Default to closed for cleaner look
const historyPanelOpen = ref(false);
const transferPanelOpen = ref(false);
const returnModalOpen = ref(false);

const selectedStudent = ref<ArchivedStudent | null>(null);
const returnComment = ref('');
const selectedGroupId = ref<number | null>(null);

// --- SORTING ---
const sortCol = ref<string>('expelled');
const sortDir = ref(-1); // Newest first by default

function setSort(col: string) {
  if (sortCol.value === col) sortDir.value *= -1;
  else { sortCol.value = col; sortDir.value = 1; }
}

function sortIcon(col: string) {
  if (sortCol.value !== col) return '↕';
  return sortDir.value === 1 ? '↑' : '↓';
}

// --- FILTERS ---
function toggleChip(k: keyof typeof chips.value) {
  chips.value[k] = !chips.value[k];
}

function toggleDf(name: string) {
  openDf.value = openDf.value === name ? null : name;
}

const filteredStudents = computed(() => {
  const q = searchQ.value.toLowerCase().trim();
  let list = archivedStore.students.filter(s => {
    if (q && !(s.name.toLowerCase().includes(q) || s.phone.includes(q))) return false;
    if (chips.value.mine && s.manager !== 'Артём') return false;
    if (chips.value.noManager && s.manager) return false;
    if (managerFilter.value !== 'all') {
      if (managerFilter.value === '__none__' && s.manager) return false;
      if (managerFilter.value !== '__none__' && s.manager !== managerFilter.value) return false;
    }
    if (reasonFilter.value !== 'all' && s.archReason !== reasonFilter.value) return false;
    return true;
  });

  if (sortCol.value) {
    list.sort((a, b) => {
      const va = a[sortCol.value as keyof ArchivedStudent] ?? '';
      const vb = b[sortCol.value as keyof ArchivedStudent] ?? '';
      return va < vb ? -sortDir.value : va > vb ? sortDir.value : 0;
    });
  }

  return list;
});

// --- HELPERS ---
const formatDate = (date: string | null) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getDaysAgo = (date: string | null) => {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const managerColor = (name: string | null) => {
  if (!name) return 'linear-gradient(135deg, #cbd5e1, #94a3b8)';
  return MANAGER_COLORS[name] || 'linear-gradient(135deg, #4f6ef7, #8b5cf6)';
};

// --- ACTIONS ---
function toggleActions(id: number) {
  openActions.value = openActions.value === id ? null : id;
}

const openHistory = (student: ArchivedStudent) => {
  selectedStudent.value = student;
  historyPanelOpen.value = true;
};

const openTransfer = (student: ArchivedStudent) => {
  selectedStudent.value = student;
  transferPanelOpen.value = true;
};

const openReturn = (student: ArchivedStudent) => {
  selectedStudent.value = student;
  returnComment.value = '';
  returnModalOpen.value = true;
};

const handleReturn = async () => {
  if (!selectedStudent.value) return;
  try {
    await archivedStore.returnToNew(selectedStudent.value.id, returnComment.value);
    notif.addToast(`✅ ${selectedStudent.value.name} — ${t('newStudents.added')}`, 'success');
    returnModalOpen.value = false;
    selectedStudent.value = null;
  } catch (err) {
    console.error(err);
  }
};

const handleTransfer = async () => {
  if (!selectedStudent.value || !selectedGroupId.value) return;
  try {
    const group = GROUPS.find(g => g.id === selectedGroupId.value);
    await archivedStore.transferToGroup(selectedStudent.value.id, selectedGroupId.value);
    notif.addToast(`✅ ${selectedStudent.value.name} → «${group?.name}»`, 'success');
    transferPanelOpen.value = false;
    selectedStudent.value = null;
    selectedGroupId.value = null;
  } catch (err) {
    console.error(err);
  }
};

const onDocClick = () => {
  openDf.value = null;
  openActions.value = null;
};

onMounted(() => {
  archivedStore.fetchStudents();
  document.addEventListener('click', onDocClick);
});

onBeforeUnmount(() => document.removeEventListener('click', onDocClick));
</script>

<template>
  <div class="ns-page">
    <div class="ns-content">
      <!-- PAGE ACTIONS ROW -->
      <div class="ns-actions-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input v-model="searchQ" :placeholder="t('archived.filter.search')" />
        </div>
        <UiButton variant="ghost" size="sm" class="btn">⬇ {{ t('common.export') }}</UiButton>
      </div>

      <!-- STATS GRID -->
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-label">{{ t('archived.stats.total') }}</div>
          <div class="stat-value">{{ archivedStore.stats.total }}</div>
          <div class="stat-sub">{{ t('archived.stats.totalSub') }}</div>
          <div class="stat-icon">🗃️</div>
        </div>
        <div class="stat-card amber">
          <div class="stat-label">{{ t('archived.stats.month') }}</div>
          <div class="stat-value">{{ archivedStore.stats.month }}</div>
          <div class="stat-sub"><span class="warn">{{ t('archived.stats.monthSub') }}</span></div>
          <div class="stat-icon">📅</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-label">{{ t('archived.stats.none') }}</div>
          <div class="stat-value">{{ archivedStore.stats.none }}</div>
          <div class="stat-sub"><span class="warn">{{ t('archived.stats.noneSub') }}</span></div>
          <div class="stat-icon">📵</div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">{{ t('archived.stats.return') }}</div>
          <div class="stat-value">{{ archivedStore.stats.return }}</div>
          <div class="stat-sub"><span class="ok">{{ t('archived.stats.returnSub', { reason: t('archived.archive.notRelevant') }) }}</span></div>
          <div class="stat-icon">↩️</div>
        </div>
      </div>

      <!-- INFO BLOCK (Collapsible) -->
      <div class="info-block" :class="{ open: isInfoOpen }">
        <div class="info-block-header" @click="isInfoOpen = !isInfoOpen">
          <span class="info-icon">💡</span>
          <span class="info-block-title">{{ t('archived.info.title') }}</span>
          <span class="info-block-arrow" :class="{ rotated: isInfoOpen }">›</span>
        </div>
        <div class="info-block-content" v-if="isInfoOpen">
          <div class="rules-row">
            <div v-for="n in 5" :key="n" class="rule-item">
              <div class="rule-num">{{ n }}</div>
              <div class="rule-text" v-html="t(`archived.info.rule${n}`)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- TOOLBAR -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <div class="section-title">
            {{ t('archived.tableToolbar.title') }}
            <span class="section-count">{{ filteredStudents.length }}</span>
          </div>
          <div class="filter-chips">
            <div class="chip" :class="{ active: chips.mine }" @click="toggleChip('mine')">
              <span class="chip-dot blue" />{{ t('newStudents.chipMine') }}
            </div>
            <div class="chip" :class="{ active: chips.noManager }" @click="toggleChip('noManager')">
              <span class="chip-dot grey" />{{ t('archived.filter.noManager') }}
            </div>
          </div>
        </div>
        <div class="toolbar-right">
          <!-- Manager filter -->
          <div class="dropdown-filter">
            <button class="dropdown-filter-btn" :class="{ 'has-value': managerFilter !== 'all' }" @click.stop="toggleDf('manager')">
              {{ managerFilter === 'all' ? t('archived.filter.allManagers') : managerFilter }} ▾
            </button>
            <div class="dropdown-filter-menu" :class="{ open: openDf === 'manager' }">
              <div class="df-item" :class="{ selected: managerFilter === 'all' }" @click="managerFilter = 'all'">{{ t('archived.filter.allManagers') }}</div>
              <div v-for="m in Object.keys(MANAGER_COLORS)" :key="m" class="df-item" :class="{ selected: managerFilter === m }" @click="managerFilter = m">{{ m }}</div>
              <div class="df-item" :class="{ selected: managerFilter === '__none__' }" @click="managerFilter = '__none__'">— {{ t('archived.filter.noManager') }}</div>
            </div>
          </div>
          <!-- Reason filter -->
          <div class="dropdown-filter">
            <button class="dropdown-filter-btn" :class="{ 'has-value': reasonFilter !== 'all' }" @click.stop="toggleDf('reason')">
              {{ reasonFilter === 'all' ? t('archived.filter.allReasons') : reasonFilter }} ▾
            </button>
            <div class="dropdown-filter-menu" :class="{ open: openDf === 'reason' }">
              <div class="df-item" :class="{ selected: reasonFilter === 'all' }" @click="reasonFilter = 'all'">{{ t('archived.filter.allReasons') }}</div>
              <div v-for="r in REASONS" :key="r" class="df-item" :class="{ selected: reasonFilter === r }" @click="reasonFilter = r">{{ r }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th @click="setSort('name')">{{ t('archived.table.name') }} <span class="sort-icon">{{ sortIcon('name') }}</span></th>
              <th @click="setSort('registered')">{{ t('archived.table.registered') }} <span class="sort-icon">{{ sortIcon('registered') }}</span></th>
              <th @click="setSort('expelled')">{{ t('archived.table.expelled') }} <span class="sort-icon">{{ sortIcon('expelled') }}</span></th>
              <th class="no-sort">{{ t('archived.table.lastContact') }}</th>
              <th class="no-sort">{{ t('archived.table.manager') }}</th>
              <th class="no-sort">{{ t('archived.table.comment') }}</th>
              <th class="no-sort">{{ t('archived.table.archReason') }}</th>
              <th class="no-sort actions-th">···</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredStudents" :key="s.id">
              <td>
                <div class="student-cell" @click="openHistory(s)">
                  <div class="st-avatar" :style="{ background: managerColor(s.manager) }">
                    {{ s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <div class="st-name">{{ s.name }}</div>
                    <div class="st-phone">{{ s.phone }}</div>
                  </div>
                </div>
              </td>
              <td><span class="date-mono">{{ formatDate(s.registered) }}</span></td>
              <td><span class="date-mono">{{ formatDate(s.expelled) }}</span></td>
              <td>
                <div class="contact-box">
                  <span v-if="!s.lastContact" class="ct-tag grey">{{ t('archived.contact.none') }}</span>
                  <template v-else>
                    <span class="ct-tag" :class="getDaysAgo(s.lastContact)! > 7 ? 'amber' : 'green'">
                      {{ getDaysAgo(s.lastContact) === 0 ? t('archived.contact.today') : t('archived.contact.daysAgo', { days: getDaysAgo(s.lastContact) }) }}
                    </span>
                    <div class="date-mono dim">{{ formatDate(s.lastContact) }}</div>
                  </template>
                </div>
              </td>
              <td>
                <div v-if="s.manager" class="person-cell">
                  <div class="m-avatar" :style="{ background: managerColor(s.manager) }">{{ s.manager.slice(0, 1) }}</div>
                  <span class="p-name">{{ s.manager }}</span>
                </div>
                <span v-else class="empty-dim">—</span>
              </td>
              <td class="comment-cell">
                <div class="text-truncate" :title="s.comment">{{ s.comment || '—' }}</div>
              </td>
              <td>
                <UiBadge variant="info" class="reason-chip">{{ s.archReason }}</UiBadge>
              </td>
              <td class="actions-td">
                <div class="actions-wrap">
                  <div class="actions-btn" @click.stop="toggleActions(s.id)">⋯</div>
                  <div class="actions-dropdown" :class="{ open: openActions === s.id }">
                    <div class="action-item success" @click="openReturn(s)"><span class="ai">🌟</span>{{ t('archived.actions.return') }}</div>
                    <div class="action-item" @click="openTransfer(s)"><span class="ai">🔄</span>{{ t('archived.actions.transfer') }}</div>
                    <div class="action-item" @click="openHistory(s)"><span class="ai">📋</span>{{ t('archived.actions.history') }}</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer">
          <span class="table-info">{{ t('archived.showing', { shown: filteredStudents.length, total: archivedStore.students.length }) }}</span>
        </div>
      </div>
    </div>

    <!-- SIDE PANEL: HISTORY -->
    <Teleport to="body">
      <div class="sp-overlay" v-if="historyPanelOpen" @click="historyPanelOpen = false" />
      <div class="side-panel" :class="{ open: historyPanelOpen }">
        <div class="sp-head">
          <div class="sp-title">📋 {{ t('archived.actions.history') }}</div>
          <div class="sp-sub">{{ selectedStudent?.name }}</div>
          <div class="sp-close" @click="historyPanelOpen = false">✕</div>
        </div>
        <div class="sp-body">
          <div v-for="(h, i) in selectedStudent?.history" :key="i" class="history-item">
            <div class="h-dot-box">
              <div class="h-dot" :style="{ background: h.color }" />
              <div class="h-line" />
            </div>
            <div class="h-content">
              <div class="h-event">{{ h.event }}</div>
              <div class="h-date">{{ formatDate(h.date) }}</div>
              <div class="h-desc">{{ h.detail }}</div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- SIDE PANEL: TRANSFER -->
    <Teleport to="body">
      <div class="sp-overlay" v-if="transferPanelOpen" @click="transferPanelOpen = false" />
      <div class="side-panel" :class="{ open: transferPanelOpen }" style="width: 400px">
        <div class="sp-head">
          <div class="sp-title">🔄 {{ t('archived.actions.transfer') }}</div>
          <div class="sp-sub">{{ selectedStudent?.name }}</div>
          <div class="sp-close" @click="transferPanelOpen = false">✕</div>
        </div>
        <div class="sp-body">
          <div class="section-label">{{ t('archived.archive.selectGroup') }}</div>
          <div class="group-select-list">
            <div
              v-for="g in GROUPS"
              :key="g.id"
              class="group-opt"
              :class="{ selected: selectedGroupId === g.id }"
              @click="selectedGroupId = g.id"
            >
              <div class="g-dot" :style="{ background: g.color }" />
              <div class="g-info">
                <div class="g-name">{{ g.name }}</div>
                <div class="g-teacher">{{ g.teacher }}</div>
              </div>
              <div class="g-slots" :class="{ full: g.slots === 0 }">
                {{ g.slots > 0 ? `${g.slots} мест` : 'Нет мест' }}
              </div>
            </div>
          </div>
        </div>
        <div class="sp-footer">
          <UiButton variant="primary" block :disabled="!selectedGroupId" @click="handleTransfer">
            ✦ {{ t('archived.actions.transferBtn') }}
          </UiButton>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: RETURN -->
    <Teleport to="body">
      <Transition name="modal">
        <div class="modal-backdrop" v-if="returnModalOpen" @click.self="returnModalOpen = false">
          <div class="modal sm">
            <div class="modal-close" @click="returnModalOpen = false">✕</div>
            <div class="modal-title">🌟 {{ t('archived.actions.return') }}</div>
            <div class="modal-sub">{{ t('archived.archive.returnSub') }}</div>
            <div class="modal-field">
              <div class="modal-label">{{ t('archived.archive.commentLabel') }}</div>
              <UiInput v-model="returnComment" :placeholder="t('archived.archive.commentPlaceholder')" />
            </div>
            <div class="modal-actions">
              <UiButton variant="ghost" @click="returnModalOpen = false">{{ t('common.cancel') }}</UiButton>
              <UiButton variant="primary" @click="handleReturn">🌟 {{ t('archived.actions.return') }}</UiButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.ns-page { display: flex; flex-direction: column; min-height: 0; flex: 1; }
.ns-content { padding: 24px 28px; flex: 1; overflow-y: auto; }
.ns-content::-webkit-scrollbar { width: 4px; }
.ns-content::-webkit-scrollbar-thumb { background: rgba(79,110,247,0.2); border-radius: 2px; }

/* ACTIONS ROW */
.ns-actions-row { display: flex; align-items: center; gap: 10px; justify-content: flex-end; margin-bottom: 20px; }
.search-box { display: flex; align-items: center; gap: 8px; background: var(--app-surface); border: 1px solid var(--app-border); border-radius: 8px; padding: 7px 12px; transition: all 0.2s; }
.search-box:focus-within { border-color: var(--app-border-hi); box-shadow: 0 0 12px rgba(79,110,247,0.1); }
.search-icon { color: var(--app-text-dim); font-size: 14px; }
.search-box input { background: none; border: none; outline: none; color: var(--app-text-main); font-family: 'Outfit', sans-serif; font-size: 13px; width: 220px; }

/* STATS */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: var(--app-card); border: 1px solid var(--app-border); border-radius: 14px; padding: 20px; position: relative; overflow: hidden; transition: all 0.3s; cursor: default; }
.stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 14px 14px 0 0; }
.stat-card.blue::before { background: linear-gradient(90deg, #4f6ef7, #8b5cf6); }
.stat-card.amber::before { background: linear-gradient(90deg, #f59e0b, #f97316); }
.stat-card.purple::before { background: linear-gradient(90deg, #8b5cf6, #4f6ef7); }
.stat-card.green::before { background: linear-gradient(90deg, #10b981, #06b6d4); }
.stat-card:hover { border-color: var(--app-border-hi); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
.stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--app-text-dim); margin-bottom: 10px; }
.stat-value { font-size: 26px; font-weight: 700; font-family: 'Space Mono', monospace; color: var(--app-text-main); line-height: 1; margin-bottom: 6px; }
.stat-sub { font-size: 11.5px; color: var(--app-text-dim); }
.stat-sub .warn { color: #f59e0b; }
.stat-sub .ok { color: #10b981; }
.stat-icon { position: absolute; top: 16px; right: 16px; font-size: 22px; opacity: 0.3; }

/* INFO BLOCK */
.info-block { background: var(--app-card); border: 1px solid var(--app-border); border-radius: 12px; margin-bottom: 24px; overflow: hidden; transition: all 0.2s; }
.info-block.open { border-color: var(--app-border-hi); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.info-block-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; user-select: none; }
.info-block-header:hover { background: rgba(79,110,247,0.04); }
.info-icon { font-size: 16px; }
.info-block-title { font-size: 13.5px; font-weight: 700; flex: 1; color: var(--app-text-main); }
.info-block-arrow { font-size: 14px; color: var(--app-text-dim); transition: transform 0.2s; }
.info-block-arrow.rotated { transform: rotate(90deg); }
.info-block-content { border-top: 1px solid var(--app-border); background: var(--app-surface); }
.rules-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding: 16px; }
.rule-item { display: flex; gap: 10px; padding: 10px; background: var(--app-card); border: 1px solid var(--app-border); border-radius: 10px; }
.rule-num { width: 22px; height: 22px; border-radius: 50%; background: #4f6ef7; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.rule-text { font-size: 12px; color: var(--app-text-dim); line-height: 1.4; }

/* TOOLBAR */
.table-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 16px; flex-wrap: wrap; }
.toolbar-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.toolbar-right { display: flex; gap: 8px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--app-text-main); display: flex; align-items: center; gap: 8px; }
.section-count { font-size: 11px; font-family: 'Space Mono', monospace; background: rgba(79,110,247,0.15); color: #4f6ef7; border: 1px solid rgba(79,110,247,0.3); padding: 2px 8px; border-radius: 8px; }

.filter-chips { display: flex; gap: 6px; align-items: center; }
.chip { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: 1px solid var(--app-border); background: var(--app-card); color: var(--app-text-dim); }
.chip:hover { border-color: var(--app-border-hi); color: var(--app-text-main); }
.chip.active { background: rgba(79,110,247,0.15); border-color: rgba(79,110,247,0.5); color: var(--app-text-main); }
.chip-dot { width: 6px; height: 6px; border-radius: 50%; }
.chip-dot.blue { background: #4f6ef7; }
.chip-dot.grey { background: #94a3b8; }

.dropdown-filter { position: relative; }
.dropdown-filter-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; font-size: 12.5px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: 1px solid var(--app-border); background: var(--app-card); color: var(--app-text-dim); font-family: 'Outfit', sans-serif; }
.dropdown-filter-btn:hover { border-color: var(--app-border-hi); color: var(--app-text-main); }
.dropdown-filter-btn.has-value { border-color: rgba(79,110,247,0.4); color: #4f6ef7; background: rgba(79,110,247,0.08); }
.dropdown-filter-menu { position: absolute; top: calc(100% + 6px); right: 0; background: var(--app-surface); border: 1px solid var(--app-border-hi); border-radius: 10px; min-width: 180px; z-index: 200; display: none; box-shadow: 0 8px 24px rgba(0,0,0,0.15); overflow: hidden; }
.dropdown-filter-menu.open { display: block; }
.df-item { padding: 9px 14px; font-size: 13px; cursor: pointer; transition: background 0.15s; color: var(--app-text-dim); }
.df-item:hover { background: rgba(79,110,247,0.1); color: var(--app-text-main); }
.df-item.selected { color: #4f6ef7; background: rgba(79,110,247,0.06); }

/* TABLE */
.table-container { background: var(--app-card); border: 1px solid var(--app-border); border-radius: 14px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
thead tr { background: var(--app-surface); border-bottom: 1px solid var(--app-border); }
th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; color: var(--app-text-dim); cursor: pointer; user-select: none; }
th:hover { color: var(--app-text-main); }
th.no-sort { cursor: default; }
.sort-icon { display: inline-block; margin-left: 4px; font-size: 10px; opacity: 0.5; }
tbody tr { border-bottom: 1px solid rgba(100,120,255,0.07); transition: background 0.15s; }
tbody tr:hover { background: rgba(79,110,247,0.04); }
td { padding: 12px 16px; font-size: 13.5px; vertical-align: middle; }

.student-cell { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.st-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white; border: 1.5px solid rgba(255,255,255,0.1); flex-shrink: 0; }
.st-name { font-weight: 600; color: #4f6ef7; }
.st-phone { font-size: 10.5px; color: var(--app-text-dim); }
.date-mono { font-family: 'Space Mono', monospace; font-size: 12.5px; color: var(--app-text-main); }
.date-mono.dim { font-size: 10.5px; color: var(--app-text-dim); }

.contact-box { display: flex; flex-direction: column; gap: 2px; }
.ct-tag { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; width: fit-content; text-transform: uppercase; }
.ct-tag.green { background: rgba(16,185,129,0.12); color: #10b981; }
.ct-tag.amber { background: rgba(245,158,11,0.15); color: #f59e0b; }
.ct-tag.grey { background: rgba(148,163,184,0.1); color: var(--app-text-dim); }

.person-cell { display: flex; align-items: center; gap: 8px; }
.m-avatar { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: white; flex-shrink: 0; }
.p-name { font-size: 13px; font-weight: 500; }
.empty-dim { color: var(--app-text-dim); opacity: 0.5; font-style: italic; }

.comment-cell { max-width: 150px; }
.text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.5px; color: var(--app-text-dim); }
.reason-chip { font-size: 10.5px; font-weight: 600; }

.actions-td { text-align: center; }
.actions-wrap { position: relative; display: inline-flex; justify-content: center; }
.actions-btn { width: 32px; height: 32px; border-radius: 8px; background: var(--app-surface); border: 1px solid var(--app-border); color: var(--app-text-dim); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
.actions-btn:hover { background: rgba(79,110,247,0.1); border-color: var(--app-border-hi); color: var(--app-text-main); }
.actions-dropdown { position: absolute; right: 0; top: calc(100% + 6px); background: var(--app-surface); border: 1px solid var(--app-border-hi); border-radius: 10px; min-width: 180px; z-index: 300; display: none; box-shadow: 0 8px 24px rgba(0,0,0,0.15); overflow: hidden; }
.actions-dropdown.open { display: block; }
.action-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; font-size: 13px; cursor: pointer; color: var(--app-text-dim); font-weight: 500; transition: background 0.15s; }
.action-item:hover { background: rgba(79,110,247,0.08); color: var(--app-text-main); }
.action-item.success { color: #10b981; }
.action-item.success:hover { background: rgba(16,185,129,0.08); }
.ai { font-size: 14px; }

.table-footer { padding: 12px 16px; border-top: 1px solid var(--app-border); display: flex; justify-content: flex-end; }
.table-info { color: var(--app-text-dim); font-size: 12.5px; }

/* SIDE PANEL */
.sp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 500; transition: opacity 0.3s; }
.side-panel { position: fixed; top: 0; right: 0; bottom: 0; width: 440px; background: var(--app-surface); border-left: 1px solid var(--app-border-hi); z-index: 600; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; }
.side-panel.open { transform: translateX(0); box-shadow: -10px 0 40px rgba(0,0,0,0.2); }
.sp-head { padding: 24px; border-bottom: 1px solid var(--app-border); position: relative; }
.sp-title { font-size: 17px; font-weight: 700; color: var(--app-text-main); }
.sp-sub { font-size: 13px; color: var(--app-text-dim); margin-top: 4px; }
.sp-close { position: absolute; top: 20px; right: 20px; width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--app-border); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--app-text-dim); transition: all 0.15s; }
.sp-close:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.3); }
.sp-body { flex: 1; overflow-y: auto; padding: 24px; }
.sp-footer { padding: 20px 24px; border-top: 1px solid var(--app-border); }

/* History scroll */
.history-item { display: flex; gap: 16px; margin-bottom: 20px; }
.h-dot-box { display: flex; flex-direction: column; align-items: center; }
.h-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.h-line { width: 1px; flex: 1; background: var(--app-border); margin-top: 4px; }
.h-content { padding-bottom: 4px; }
.h-event { font-size: 14px; font-weight: 600; color: var(--app-text-main); }
.h-date { font-size: 11px; color: var(--app-text-dim); font-family: 'Space Mono', monospace; margin: 2px 0 6px; }
.h-desc { font-size: 13px; color: var(--app-text-dim); line-height: 1.4; }

/* Group list */
.section-label { font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--app-text-dim); margin-bottom: 12px; }
.group-select-list { display: flex; flex-direction: column; gap: 10px; }
.group-opt { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--app-border); border-radius: 12px; cursor: pointer; transition: all 0.2s; background: var(--app-card); }
.group-opt:hover { border-color: var(--app-border-hi); transform: translateX(4px); }
.group-opt.selected { border-color: #4f6ef7; background: rgba(79,110,247,0.06); box-shadow: 0 4px 12px rgba(79,110,247,0.1); }
.g-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.g-info { flex: 1; }
.g-name { font-size: 13.5px; font-weight: 600; color: var(--app-text-main); }
.g-teacher { font-size: 11px; color: var(--app-text-dim); }
.g-slots { font-size: 11px; font-family: 'Space Mono', monospace; color: #10b981; font-weight: 600; }
.g-slots.full { color: #ef4444; }

/* MODAL */
.modal-backdrop { position: fixed; inset: 0; background: rgba(4,4,15,0.8); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.modal { background: var(--app-surface); border: 1px solid var(--app-border-hi); border-radius: 16px; padding: 28px; width: 420px; position: relative; box-shadow: 0 24px 60px rgba(0,0,0,0.4); }

.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-enter-from .modal { transform: scale(0.9) translateY(20px); }
.modal-close { position: absolute; top: 16px; right: 16px; cursor: pointer; color: var(--app-text-dim); font-size: 14px; }
.modal-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; color: var(--app-text-main); }
.modal-sub { font-size: 13px; color: var(--app-text-dim); margin-bottom: 20px; line-height: 1.4; }
.modal-field { margin-bottom: 20px; }
.modal-label { font-size: 11.5px; font-weight: 600; text-transform: uppercase; color: var(--app-text-dim); margin-bottom: 8px; }
.modal-actions { display: flex; gap: 12px; }
.modal-actions .btn { flex: 1; justify-content: center; }
</style>
