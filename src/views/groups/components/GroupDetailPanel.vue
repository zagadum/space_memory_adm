<template>
  <div>
    <!-- Overlay -->
    <div :class="['gp-overlay', 'active']" @click="$emit('close')"></div>

    <!-- Panel -->
    <div class="gp-panel open">

      <!-- HEADER -->
      <div class="gp-header">
        <div class="gp-header-top">
          <div>
            <div class="gp-title">{{ group.name }}</div>
            <div class="gp-subtitle">
              <span>{{ group.day }}</span>
              <span class="sep">·</span>
              <span>{{ group.time }}</span>
              <template v-if="group.teacher">
                <span class="sep">·</span>
                <span>{{ group.teacher.name }}</span>
              </template>
              <span class="sep">·</span>
              <span>Старт: {{ fmtDate(group.startDate) }}</span>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <button class="gp-btn-delete" @click="confirmDelete">🗑 Удалить группу</button>
            <div class="gp-close" @click="$emit('close')">✕</div>
          </div>
        </div>
        <div class="gp-chips">
          <span :class="['gp-chip', 'blue']">{{ group.type === 'individual' ? '👤 Индивидуальная' : '👥 Групповая' }}</span>
          <span v-if="ageInfo" :class="['gp-chip', 'purple']">{{ ageInfo.icon }} {{ ageInfo.label }}</span>
          <span class="gp-chip">📅 Создана {{ fmtDate(group.createdDate) }}</span>
          <span :class="['gp-chip', daysDiff(group.createdDate) > 14 ? 'amber' : 'green']">⏱ {{ daysDiff(group.createdDate) }} дней ожидания</span>
          <span v-if="group.manager" class="gp-chip">👤 {{ group.manager.name }}</span>
          <span v-else class="gp-chip amber">⚠️ Без ответственного</span>
        </div>
      </div>

      <!-- START BAR -->
      <div class="gp-start-bar">
        <div class="gp-start-info">
          <div>
            <div class="gp-ratio-big" :style="{ color: ratioColor, textShadow: '0 0 20px ' + ratioColor + '55' }">
              {{ actualPaid }}/{{ actualTotal }}
            </div>
            <div class="gp-ratio-sub">
              <span :style="{ color: 'var(--green)' }">{{ actualPaid }} активируются</span>
              <template v-if="notPaid > 0"> · <span :style="{ color: 'var(--amber)' }">{{ notPaid }} ожидают</span></template>
            </div>
          </div>
          <div class="gp-mini-bars">
            <div class="gp-bar-row">
              <span class="gp-bar-label">Подписали договор</span>
              <div class="gp-bar-track"><div class="gp-bar-fill green" :style="{ width: contractPct + '%' }"></div></div>
              <span class="gp-bar-val" style="color:var(--green)">{{ contractCount }}</span>
            </div>
            <div class="gp-bar-row">
              <span class="gp-bar-label">Оплатили</span>
              <div class="gp-bar-track"><div :class="['gp-bar-fill', pct === 100 ? 'green' : 'amber']" :style="{ width: pct + '%' }"></div></div>
              <span class="gp-bar-val" :style="{ color: pct === 100 ? 'var(--green)' : 'var(--amber)' }">{{ actualPaid }}</span>
            </div>
          </div>
        </div>
        <button class="gp-start-btn" @click="$emit('start')">🚀 Старт группы</button>
      </div>

      <!-- BODY -->
      <div class="gp-body">
        <div class="gp-section-label">
          <div style="display:flex;align-items:center;gap:8px">
            <span>Список учеников</span>
            <span class="gp-count-pill" v-if="!loadingStudents">{{ students.length }} чел.</span>
          </div>
          <button class="gp-btn-add" @click="addPanelOpen = true">➕ Добавить учеников</button>
        </div>

        <div v-if="loadingStudents" style="text-align:center;padding:40px;color:var(--dim)">Загрузка...</div>

        <div v-else class="gp-table-wrap">
          <table class="gp-table">
            <thead>
              <tr>
                <th>Имя Фамилия</th>
                <th>Возраст</th>
                <th>Договор</th>
                <th>Оплата</th>
                <th>Дата записи</th>
                <th>Ожидание</th>
                <th>Ответственный</th>
                <th style="width:130px;text-align:center">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="students.length === 0">
                <td colspan="8">
                  <div class="gp-empty">
                    <div class="gp-empty-icon">👤</div>
                    Ученики не добавлены
                  </div>
                </td>
              </tr>
              <tr
                v-for="s in students"
                :key="String(s.id)"
                :class="s.contract !== 'signed' ? 'row-not-ready' : ''"
              >
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="status-dot" :style="{ background: s.contract === 'signed' ? 'var(--green)' : 'var(--amber)', boxShadow: '0 0 4px ' + (s.contract === 'signed' ? 'var(--green)' : 'var(--amber)') }"></div>
                    <span style="font-weight:500">{{ s.name }}</span>
                  </div>
                </td>
                <td>
                  <span class="age-mono">{{ s.age }}</span>
                  <span style="color:var(--dim);font-size:11px"> лет</span>
                </td>
                <td>
                  <span :class="['contract-badge', s.contract === 'signed' ? 'contract-signed' : 'contract-pending']">
                    {{ s.contract === 'signed' ? '✓ Подписан' : '⏳ Ожидает' }}
                  </span>
                </td>
                <td>
                  <span :class="['payment-mono', s.paymentStr === '0 zł' ? 'payment-zero' : '']">{{ s.paymentStr }}</span>
                </td>
                <td><span class="date-mono">{{ fmtDate(s.createdDate) }}</span></td>
                <td>
                  <div class="timer-cell">
                    <span :class="['timer-days', timerCls(daysDiff(s.createdDate))]">{{ daysDiff(s.createdDate) }}</span>
                    <span class="timer-label">дн.</span>
                  </div>
                </td>
                <td>
                  <span v-if="s.manager" style="font-size:12.5px;font-weight:500">{{ s.manager }}</span>
                  <span v-else class="empty-cell">—</span>
                </td>
                <td>
                  <div class="row-actions">
                    <div class="ra-btn archive" data-tip="В архив" @click="notify.addToast('📦 ' + s.name + ' перемещён в архив', 'warning')">📦</div>
                    <div class="ra-btn remove"  data-tip="Убрать из группы" @click="removeStudent(s.id, s.name)">✕</div>
                    <div class="ra-btn transfer" data-tip="Перенести в группу" @click="notify.addToast('🔀 Перенос ' + s.name + ' — выберите группу', 'warning')">🔀</div>
                    <div class="ra-btn email" data-tip="Отправить Email" @click="notify.addToast('✉ Email отправлен: ' + s.name, 'success')">✉</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ADD STUDENTS SUB-PANEL -->
    <div v-if="addPanelOpen" :class="['asp-panel', 'open']">
      <div class="asp-header">
        <div>
          <div class="asp-title">➕ Добавить учеников</div>
          <div class="asp-sub">Выберите учеников для добавления в группу</div>
        </div>
        <div class="gp-close" @click="addPanelOpen = false">✕</div>
      </div>
      <div class="asp-search-wrap">
        <div class="asp-search-box">
          <span style="color:var(--dim);font-size:14px">🔍</span>
          <input v-model="aspQuery" type="text" placeholder="Поиск ученика по имени..." style="flex:1;background:none;border:none;outline:none;color:var(--white);font-family:'Outfit',sans-serif;font-size:13px" />
        </div>
      </div>
      <div class="asp-list">
        <div
          v-for="s in filteredMaster"
          :key="s.id"
          :class="['asp-item', aspSelected.has(s.id) ? 'selected' : '', alreadyInGroup.has(s.name) ? 'in-group' : '']"
          :style="alreadyInGroup.has(s.name) ? 'opacity:0.5;cursor:default' : ''"
          @click="!alreadyInGroup.has(s.name) && toggleAsp(s.id)"
        >
          <div :class="['asp-checkbox', aspSelected.has(s.id) ? 'checked' : '']"></div>
          <div class="asp-avatar" :style="{ background: s.color }">{{ s.initials }}</div>
          <div class="asp-info">
            <div class="asp-name">{{ s.name }}</div>
            <div class="asp-meta">{{ s.meta }}</div>
          </div>
          <span v-if="alreadyInGroup.has(s.name)" class="asp-status already">Уже в группе</span>
          <span v-else-if="aspSelected.has(s.id)" class="asp-status new">Выбран</span>
        </div>
      </div>
      <div class="asp-footer">
        <span :class="['asp-sel-info', aspSelected.size > 0 ? 'has-sel' : '']">
          {{ aspSelected.size > 0 ? aspSelected.size + ' ' + (aspSelected.size === 1 ? 'ученик выбран' : aspSelected.size < 5 ? 'ученика выбрано' : 'учеников выбрано') : 'Никто не выбран' }}
        </span>
        <div style="display:flex;gap:10px">
          <button class="btn btn-ghost" style="font-size:13px;padding:8px 16px" @click="addPanelOpen = false">Отмена</button>
          <button class="btn btn-primary" style="font-size:13px;padding:8px 18px" @click="confirmAdd">✅ Добавить выбранных</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRM -->
    <div v-if="deleteConfirm" class="dc-overlay" @click.self="deleteConfirm = false">
      <div class="dc-box">
        <div class="dc-icon">🗑️</div>
        <div class="dc-title">Удалить группу?</div>
        <div class="dc-sub">Вы уверены, что хотите удалить группу<br><strong>{{ group.name }}</strong>?<br>Это действие нельзя отменить.</div>
        <div class="dc-actions">
          <button class="btn btn-ghost" style="padding:9px 20px" @click="deleteConfirm = false">Отмена</button>
          <button class="btn" style="background:var(--red);color:white;padding:9px 20px;border:none;box-shadow:0 0 16px rgba(239,68,68,0.3)" @click="doDelete">🗑 Удалить</button>
        </div>
      </div>
    </div>

    <!-- TOAST REMOVED -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NewGroup, NewGroupStudent, MasterStudent } from '../../../api/newGroupsApi'
import { ageMap, fmtDate, daysDiff } from '../../../utils/newGroupsUtils'
import { useNotificationStore } from '../../../stores/notification.store'

const notify = useNotificationStore()

const props = defineProps<{
  group: NewGroup
  students: NewGroupStudent[]
  masterStudents: MasterStudent[]
  loadingStudents: boolean
}>()

const emit = defineEmits<{
  close: []
  start: []
  delete: [id: number]
  'students-added': [payload: { groupId: number; studentIds: number[] }]
  'student-removed': [payload: { groupId: number; studentId: number }]
}>()

const addPanelOpen = ref(false)
const aspQuery = ref('')
const aspSelected = ref<Set<number>>(new Set())
const deleteConfirm = ref(false)

const ageInfo = computed(() => ageMap[props.group.age ?? ''] ?? null)
// Когда студенты загружены — считаем из них. Иначе fallback на group.paid
const actualTotal = computed(() =>
  props.students.length > 0 ? props.students.length : props.group.totalSlots
)
const actualPaid = computed(() =>
  props.students.length > 0
    ? props.students.filter(s => s.contract === 'signed').length
    : props.group.paid
)
const pct = computed(() =>
  actualTotal.value > 0 ? Math.round(actualPaid.value / actualTotal.value * 100) : 0
)
const notPaid = computed(() => actualTotal.value - actualPaid.value)
const ratioColor = computed(() => pct.value === 100 ? 'var(--green)' : pct.value >= 50 ? 'var(--amber)' : 'var(--red)')
const contractCount = computed(() => props.students.filter(s => s.contract === 'signed').length)
const contractPct = computed(() =>
  actualTotal.value > 0 ? Math.round(contractCount.value / actualTotal.value * 100) : 0
)

const alreadyInGroup = computed(() => new Set(props.students.map(s => s.name)))

const filteredMaster = computed(() => {
  const q = aspQuery.value.toLowerCase().trim()
  return q ? props.masterStudents.filter(s => s.name.toLowerCase().includes(q)) : props.masterStudents
})

function timerCls(days: number) {
  return days <= 7 ? 'low' : days <= 21 ? 'mid' : 'high'
}

function toggleAsp(id: number) {
  const s = new Set(aspSelected.value)
  s.has(id) ? s.delete(id) : s.add(id)
  aspSelected.value = s
}

async function confirmAdd() {
  if (aspSelected.value.size === 0) {
    notify.addToast('⚠️ Выберите хотя бы одного ученика', 'warning')
    return
  }
  emit('students-added', { groupId: props.group.id, studentIds: [...aspSelected.value] })
  addPanelOpen.value = false
  aspSelected.value = new Set()
  aspQuery.value = ''
  notify.addToast('Ученики добавлены ✅', 'success')
}

function removeStudent(studentId: number | string, name: string) {
  emit('student-removed', { groupId: props.group.id, studentId: Number(studentId) })
  notify.addToast('✕ ' + name + ' убран из группы', 'warning')
}

function confirmDelete() {
  deleteConfirm.value = true
}

function doDelete() {
  deleteConfirm.value = false
  emit('delete', props.group.id)
}
</script>

<style scoped>
/* OVERLAY */
.gp-overlay {
  position: fixed; inset: 0;
  background: rgba(4,4,15,0.55);
  backdrop-filter: blur(4px);
  z-index: 300;
}

/* PANEL */
.gp-panel {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 820px; max-width: 100vw;
  background: rgba(7,7,32,0.98);
  border-left: 1px solid var(--bh);
  backdrop-filter: blur(30px);
  z-index: 400;
  display: flex; flex-direction: column;
  overflow: hidden;
}

.gp-header {
  padding: 22px 28px 18px;
  border-bottom: 1px solid var(--b);
  flex-shrink: 0;
  background: rgba(13,13,43,0.8);
}

.gp-header-top {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 16px;
  margin-bottom: 16px;
}

.gp-title { font-size: 20px; font-weight: 700; }
.gp-subtitle {
  font-size: 12.5px; color: var(--dim);
  margin-top: 4px; display: flex; align-items: center; gap: 8px;
}
.sep { opacity: 0.4; }

.gp-close {
  width: 32px; height: 32px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; cursor: pointer;
  background: rgba(255,255,255,0.06); border: 1px solid var(--b);
  color: var(--dim); font-size: 15px; transition: all 0.15s;
}
.gp-close:hover { background: rgba(239,68,68,0.15); color: var(--red); border-color: rgba(239,68,68,0.3); }

.gp-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.gp-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 11px; border-radius: 20px;
  font-size: 11.5px; font-weight: 600;
  background: rgba(255,255,255,0.05); border: 1px solid var(--b);
  color: var(--dim);
}
.gp-chip.green  { background: rgba(16,185,129,0.12); color: var(--green);  border-color: rgba(16,185,129,0.3); }
.gp-chip.blue   { background: rgba(79,110,247,0.12);  color: var(--blue);   border-color: rgba(79,110,247,0.3); }
.gp-chip.amber  { background: rgba(245,158,11,0.12);  color: var(--amber);  border-color: rgba(245,158,11,0.3); }
.gp-chip.purple { background: rgba(139,92,246,0.12);  color: var(--purple); border-color: rgba(139,92,246,0.3); }

/* START BAR */
.gp-start-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px 28px;
  background: rgba(16,185,129,0.05);
  border-bottom: 1px solid rgba(16,185,129,0.15);
  flex-shrink: 0;
}
.gp-start-info { display: flex; align-items: center; gap: 20px; }
.gp-ratio-big { font-family: 'Space Mono', monospace; font-size: 28px; font-weight: 700; line-height: 1; }
.gp-ratio-sub { font-size: 12px; color: var(--dim); margin-top: 3px; }
.gp-mini-bars { display: flex; flex-direction: column; gap: 5px; min-width: 180px; }
.gp-bar-row { display: flex; align-items: center; gap: 8px; font-size: 11.5px; }
.gp-bar-label { width: 110px; color: var(--dim); }
.gp-bar-track { flex: 1; height: 5px; background: rgba(255,255,255,0.07); border-radius: 3px; overflow: hidden; }
.gp-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
.gp-bar-fill.green { background: linear-gradient(90deg, var(--green), #34d399); }
.gp-bar-fill.amber { background: linear-gradient(90deg, var(--amber), #fcd34d); }
.gp-bar-val { font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; width: 28px; text-align: right; }

.gp-start-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px; border-radius: 10px;
  background: linear-gradient(135deg, var(--green), var(--cyan));
  color: white; font-size: 14px; font-weight: 700;
  border: none; cursor: pointer;
  box-shadow: 0 0 20px rgba(16,185,129,0.3);
  transition: all 0.2s; font-family: 'Outfit', sans-serif;
  flex-shrink: 0;
}
.gp-start-btn:hover { box-shadow: 0 0 32px rgba(16,185,129,0.5); transform: translateY(-1px); }

/* BODY */
.gp-body { flex: 1; overflow-y: auto; padding: 20px 28px; }
.gp-section-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--dim);
  margin-bottom: 12px;
  display: flex; align-items: center; justify-content: space-between;
}
.gp-count-pill {
  font-family: 'Space Mono', monospace;
  color: var(--blue); font-size: 10px;
  background: rgba(79,110,247,0.12);
  border: 1px solid rgba(79,110,247,0.25);
  padding: 2px 7px; border-radius: 8px;
}

.gp-table-wrap { border: 1px solid var(--b); border-radius: 12px; overflow: hidden; overflow-x: auto; }
.gp-table { width: 100%; border-collapse: collapse; min-width: 760px; }
.gp-table thead tr { background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--b); }
.gp-table th { padding: 10px 13px; text-align: left; font-size: 10.5px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--dim); white-space: nowrap; }
.gp-table tbody tr { border-bottom: 1px solid rgba(100,120,255,0.06); transition: background 0.12s; }
.gp-table tbody tr:last-child { border-bottom: none; }
.gp-table tbody tr:hover { background: rgba(79,110,247,0.05); }
.gp-table td { padding: 11px 13px; font-size: 13px; vertical-align: middle; }
.row-not-ready td:first-child { border-left: 2px solid rgba(245,158,11,0.45); }

.gp-empty { text-align: center; padding: 40px 20px; color: var(--dim); font-size: 13.5px; }
.gp-empty-icon { font-size: 32px; margin-bottom: 10px; }

.status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.age-mono { font-family: 'Space Mono', monospace; font-size: 12.5px; font-weight: 700; }

.contract-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.contract-signed  { background: rgba(16,185,129,0.13); color: var(--green); border: 1px solid rgba(16,185,129,0.3); }
.contract-pending { background: rgba(245,158,11,0.12);  color: var(--amber); border: 1px solid rgba(245,158,11,0.3); }

.payment-mono { font-family: 'Space Mono', monospace; font-size: 12.5px; font-weight: 700; color: var(--green); }
.payment-zero { color: var(--dim); }

.date-mono { font-family: 'Space Mono', monospace; font-size: 12px; }
.timer-cell { display: flex; flex-direction: column; align-items: flex-start; }
.timer-days { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; }
.timer-label { font-size: 10px; color: var(--dim); text-transform: uppercase; }
.timer-days.low { color: var(--green); }
.timer-days.mid { color: var(--amber); }
.timer-days.high { color: var(--red); }
.empty-cell { color: rgba(136,146,176,0.35); font-size: 12px; font-style: italic; }

.row-actions { display: flex; align-items: center; gap: 4px; opacity: 0; transition: opacity 0.15s; }
.gp-table tbody tr:hover .row-actions { opacity: 1; }

.ra-btn {
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  border-radius: 6px; cursor: pointer;
  background: rgba(255,255,255,0.04); border: 1px solid var(--b);
  font-size: 13px; transition: all 0.15s; position: relative;
}
.ra-btn:hover { border-color: var(--bh); }
.ra-btn.archive:hover  { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.4); }
.ra-btn.remove:hover   { background: rgba(239,68,68,0.15);  border-color: rgba(239,68,68,0.4); }
.ra-btn.transfer:hover { background: rgba(79,110,247,0.15); border-color: rgba(79,110,247,0.4); }
.ra-btn.email:hover    { background: rgba(6,182,212,0.15);  border-color: rgba(6,182,212,0.4); }

.ra-btn[data-tip]:hover::after {
  content: attr(data-tip);
  position: absolute; bottom: calc(100% + 6px); left: 50%;
  transform: translateX(-50%);
  background: rgba(13,13,43,0.97); border: 1px solid var(--bh);
  color: var(--white); font-size: 11px; font-weight: 500;
  padding: 4px 9px; border-radius: 6px;
  white-space: nowrap; pointer-events: none;
  font-family: 'Outfit', sans-serif; z-index: 10;
}

/* PANEL ACTION BTNS */
.gp-btn-delete {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 13px; border-radius: 8px; font-size: 12.5px; font-weight: 600;
  font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s;
  background: rgba(239,68,68,0.08); color: var(--red);
  border: 1px solid rgba(239,68,68,0.25);
}
.gp-btn-delete:hover { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.5); box-shadow: 0 0 12px rgba(239,68,68,0.15); }

.gp-btn-add {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 8px; font-size: 11.5px; font-weight: 600;
  font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s;
  background: rgba(79,110,247,0.12); color: var(--blue);
  border: 1px solid rgba(79,110,247,0.3);
}
.gp-btn-add:hover { background: rgba(79,110,247,0.22); border-color: rgba(79,110,247,0.5); box-shadow: 0 0 12px rgba(79,110,247,0.2); }

/* ADD STUDENTS SUB-PANEL */
.asp-panel {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 420px;
  background: var(--app-bg);
  border-left: 1px solid var(--bh);
  backdrop-filter: blur(30px);
  z-index: 500;
  display: flex; flex-direction: column;
  box-shadow: -12px 0 40px rgba(0,0,0,0.5);
}
.asp-header {
  padding: 22px 22px 16px;
  border-bottom: 1px solid var(--b);
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  flex-shrink: 0; background: var(--app-surface);
}
.asp-title { font-size: 16px; font-weight: 700; margin-bottom: 3px; }
.asp-sub   { font-size: 12px; color: var(--dim); }
.asp-search-wrap {
  padding: 14px 22px 10px; border-bottom: 1px solid var(--b);
  flex-shrink: 0;
}
.asp-search-box {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--b); border-radius: 8px; padding: 7px 12px;
}
.asp-list { flex: 1; overflow-y: auto; padding: 8px 14px; }
.asp-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px; border-radius: 9px;
  cursor: pointer; transition: background 0.14s;
  user-select: none; margin-bottom: 2px;
  border: 1px solid transparent;
}
.asp-item:hover { background: rgba(79,110,247,0.07); }
.asp-item.selected { background: rgba(79,110,247,0.12); border-color: rgba(79,110,247,0.28); }

.asp-checkbox {
  width: 20px; height: 20px; border-radius: 6px;
  border: 1.5px solid var(--bh);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.15s;
  background: rgba(255,255,255,0.03);
}
.asp-checkbox.checked {
  background: linear-gradient(135deg, var(--blue), var(--purple));
  border-color: transparent; box-shadow: 0 0 8px rgba(79,110,247,0.4);
}
.asp-checkbox::after { content: '✓'; font-size: 12px; color: white; display: none; }
.asp-checkbox.checked::after { display: block; }

.asp-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
  border: 1.5px solid rgba(255,255,255,0.1);
}
.asp-info { flex: 1; min-width: 0; }
.asp-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.asp-meta { font-size: 11px; color: var(--dim); margin-top: 1px; }
.asp-status { font-size: 10.5px; font-weight: 600; padding: 2px 8px; border-radius: 10px; white-space: nowrap; flex-shrink: 0; }
.asp-status.already { background: rgba(16,185,129,0.1); color: var(--green); border: 1px solid rgba(16,185,129,0.25); }
.asp-status.new     { background: rgba(79,110,247,0.1);  color: var(--blue);  border: 1px solid rgba(79,110,247,0.25); }

.asp-footer {
  padding: 14px 22px; border-top: 1px solid var(--b);
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  background: var(--app-surface); gap: 12px;
}
.asp-sel-info { font-size: 12.5px; color: var(--dim); flex: 1; font-family: 'Space Mono', monospace; }
.asp-sel-info.has-sel { color: var(--blue); }

/* DELETE CONFIRM */
.dc-overlay {
  position: fixed; inset: 0;
  background: var(--glass-bg); backdrop-filter: blur(8px);
  z-index: 600; display: flex; align-items: center; justify-content: center;
}
.dc-box {
  background: var(--card); border: 1px solid rgba(239,68,68,0.4);
  border-radius: 16px; padding: 30px 32px;
  max-width: 380px; width: calc(100vw - 40px);
  text-align: center;
  box-shadow: 0 0 60px rgba(239,68,68,0.15), 0 24px 60px rgba(0,0,0,0.5);
}
.dc-icon  { font-size: 40px; margin-bottom: 14px; }
.dc-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; color: var(--red); }
.dc-sub   { font-size: 13px; color: var(--dim); margin-bottom: 24px; line-height: 1.5; }
.dc-actions { display: flex; gap: 10px; justify-content: center; }


/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s; border: none; }
.btn-primary { background: linear-gradient(135deg, var(--blue), var(--purple)); color: white; box-shadow: 0 0 16px rgba(79,110,247,0.3); }
.btn-primary:hover { box-shadow: 0 0 24px rgba(79,110,247,0.5); transform: translateY(-1px); }
.btn-ghost { background: rgba(255,255,255,0.05); color: var(--dim); border: 1px solid var(--b) !important; }
.btn-ghost:hover { background: rgba(255,255,255,0.08); color: var(--white); border-color: var(--bh) !important; }
</style>
