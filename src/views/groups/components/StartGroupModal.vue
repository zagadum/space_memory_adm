<template>
  <div class="modal-backdrop active" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-close-btn" @click="$emit('close')">✕</div>
      <div class="modal-title">🚀 Старт · {{ group.name }}</div>
      <div class="modal-sub">{{ group.day }}, {{ group.time }} · Дата старта: {{ fmtDate(group.startDate) }}</div>

      <!-- Readiness -->
      <div class="start-readiness">
        <div class="start-ratio-big" :style="{ color: ratioColor, textShadow: '0 0 30px ' + ratioColor + '66' }">
          {{ group.paid }}/{{ group.totalSlots }}
        </div>
        <div class="start-ratio-label">
          {{ group.paid }} {{ plural(group.paid, 'ученик', 'ученика', 'учеников') }} из {{ group.totalSlots }} готовы к старту
        </div>
        <div class="start-progress-bar">
          <div class="start-progress-fill" :style="{ width: pct + '%' }"></div>
        </div>
      </div>

      <!-- Info grid -->
      <div class="start-info-grid">
        <div class="start-info-item">
          <div class="start-info-label">Тип группы</div>
          <div class="start-info-value">{{ group.type === 'individual' ? '👤 Индивидуальная' : '👥 Групповая' }}</div>
        </div>
        <div class="start-info-item">
          <div class="start-info-label">Учитель</div>
          <div class="start-info-value">{{ group.teacher?.name ?? '— не назначен' }}</div>
        </div>
        <div class="start-info-item">
          <div class="start-info-label">Оплатили / подписали</div>
          <div class="start-info-value" :style="{ color: ratioColor }">{{ group.paid }} из {{ group.totalSlots }}</div>
        </div>
        <div class="start-info-item">
          <div class="start-info-label">Возрастная группа</div>
          <div class="start-info-value">{{ ageLabel }}</div>
        </div>
      </div>

      <!-- Logic warning -->
      <div class="start-logic-warning">
        <div class="slw-header">
          <span class="slw-icon">⚡</span>
          <span class="slw-title">Что произойдёт при запуске</span>
        </div>
        <div class="slw-body">
          <div class="slw-row">
            <div class="slw-dot green"></div>
            <div class="slw-text">
              <strong class="hl-green">{{ group.paid }} {{ plural(group.paid, 'ученик', 'ученика', 'учеников') }}</strong> — оплатили и подписали договор.
              Их аккаунты будут <strong>активированы</strong> и группа стартует для них немедленно.
            </div>
          </div>
          <template v-if="notPaid > 0">
            <div class="slw-row">
              <div class="slw-dot amber"></div>
              <div class="slw-text">
                <strong class="hl-amber">{{ notPaid }} {{ plural(notPaid, 'ученик', 'ученика', 'учеников') }}</strong> — ещё не оплатили или не подписали договор.
                Они получат статус <strong>«Ожидание старта»</strong> и будут активированы автоматически после оплаты.
              </div>
            </div>
            <div class="slw-row">
              <div class="slw-dot red"></div>
              <div class="slw-text">
                Занятия начнутся без ожидающих учеников. Как только они оплатят — их аккаунт автоматически присоединится к группе.
              </div>
            </div>
          </template>
          <div v-else class="slw-row">
            <div class="slw-dot green"></div>
            <div class="slw-text">Все ученики готовы! Группа стартует в <strong>полном составе</strong>.</div>
          </div>
        </div>
      </div>

      <!-- Ready students -->
      <div v-if="group.paid > 0" class="start-students-section">
        <div class="sss-header sss-green" @click="showReady = !showReady">
          <span>✅ Активируются сразу</span>
          <span class="sss-count">{{ group.paid }} чел.</span>
        </div>
        <div v-show="showReady" class="sss-list">
          <div v-for="s in readyStudents" :key="s.id" class="sss-item">
            <div class="sss-item-name">{{ s.name }}</div>
            <div class="sss-item-meta">{{ s.meta }}</div>
            <span class="sss-status active">Активируется</span>
          </div>
        </div>
      </div>

      <!-- Waiting students -->
      <div v-if="notPaid > 0" class="start-students-section">
        <div class="sss-header sss-amber" @click="showWaiting = !showWaiting">
          <span>⏳ Ожидание старта</span>
          <span class="sss-count">{{ notPaid }} чел.</span>
        </div>
        <div v-show="showWaiting" class="sss-list">
          <div v-for="s in waitingStudents" :key="s.id" class="sss-item">
            <div class="sss-item-name">{{ s.name }}</div>
            <div class="sss-item-meta">{{ s.meta }}</div>
            <span class="sss-status waiting">Ожидание</span>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-ghost" @click="$emit('close')">Отмена</button>
        <button class="btn btn-primary" @click="$emit('confirmed', group.id)">🚀 Запустить группу</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NewGroup, MasterStudent } from '../../../api/newGroupsApi'

const props = defineProps<{
  group: NewGroup
  allStudents: MasterStudent[]
}>()

defineEmits<{
  close: []
  confirmed: [id: number]
}>()

const showReady = ref(true)
const showWaiting = ref(true)

const ageMap: Record<string, { label: string; icon: string }> = {
  junior: { label: '5–7',   icon: '🟢' },
  middle: { label: '8–10',  icon: '🟡' },
  senior: { label: '11–14', icon: '🔴' },
  adult:  { label: '15+',   icon: '🟣' },
}

const pct = computed(() => Math.round(props.group.paid / props.group.totalSlots * 100))
const notPaid = computed(() => props.group.totalSlots - props.group.paid)
const ageLabel = computed(() => {
  const ai = ageMap[props.group.age ?? '']
  return ai ? ai.icon + ' ' + ai.label : '—'
})
const ratioColor = computed(() => pct.value === 100 ? 'var(--green)' : pct.value >= 50 ? 'var(--amber)' : 'var(--red)')

const readyStudents = computed(() =>
  props.group.students
    .slice(0, props.group.paid)
    .map(id => props.allStudents.find(s => s.id === id))
    .filter(Boolean) as MasterStudent[]
)

const waitingStudents = computed(() =>
  props.group.students
    .slice(props.group.paid)
    .map(id => props.allStudents.find(s => s.id === id))
    .filter(Boolean) as MasterStudent[]
)

function fmtDate(s: string) {
  if (!s) return '—'
  const [y, m, d] = s.split('-')
  return `${d}.${m}.${y}`
}

function plural(n: number, a: string, b: string, c: string) {
  const m = n % 10, h = n % 100
  if (m === 1 && h !== 11) return a
  if ([2,3,4].includes(m) && ![12,13,14].includes(h)) return b
  return c
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(4,4,15,0.82);
  backdrop-filter: blur(8px);
  z-index: 500;
  display: flex; align-items: center; justify-content: center;
}

.modal {
  background: var(--card);
  border: 1px solid var(--bh);
  border-radius: 16px;
  padding: 28px;
  width: 600px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  position: relative;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(79,110,247,0.08);
}

.modal-close-btn {
  position: absolute; top: 16px; right: 16px;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 6px; cursor: pointer;
  background: rgba(255,255,255,0.06); border: 1px solid var(--b);
  color: var(--dim); font-size: 14px; transition: all 0.15s;
}
.modal-close-btn:hover { background: rgba(239,68,68,0.15); color: var(--red); }

.modal-title { font-size: 18px; font-weight: 700; margin-bottom: 4px; padding-right: 36px; }
.modal-sub { font-size: 12.5px; color: var(--dim); margin-bottom: 20px; }

.start-readiness {
  background: rgba(16,185,129,0.07);
  border: 1px solid rgba(16,185,129,0.2);
  border-radius: 12px;
  padding: 20px; text-align: center; margin: 16px 0;
}

.start-ratio-big {
  font-family: 'Space Mono', monospace;
  font-size: 42px; font-weight: 700; line-height: 1;
}

.start-ratio-label { font-size: 13px; color: var(--dim); margin-top: 6px; }

.start-progress-bar {
  height: 8px; background: rgba(255,255,255,0.06);
  border-radius: 4px; overflow: hidden; margin: 16px 0 8px;
}
.start-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--green), var(--cyan));
  border-radius: 4px; transition: width 0.5s ease;
}

.start-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.start-info-item { background: rgba(255,255,255,0.03); border: 1px solid var(--b); border-radius: 8px; padding: 10px 12px; }
.start-info-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--dim); margin-bottom: 4px; }
.start-info-value { font-size: 13.5px; font-weight: 600; }

.start-logic-warning {
  background: rgba(79,110,247,0.07);
  border: 1px solid rgba(79,110,247,0.25);
  border-radius: 10px; padding: 14px 16px; margin-bottom: 14px;
}
.slw-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.slw-icon { font-size: 16px; }
.slw-title { font-size: 12px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--blue); }
.slw-body { display: flex; flex-direction: column; gap: 8px; }
.slw-row { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; line-height: 1.5; }
.slw-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
.slw-dot.green { background: var(--green); box-shadow: 0 0 6px rgba(16,185,129,0.6); }
.slw-dot.amber { background: var(--amber); box-shadow: 0 0 6px rgba(245,158,11,0.6); }
.slw-dot.red   { background: var(--red);   box-shadow: 0 0 6px rgba(239,68,68,0.6); }
.slw-text { color: var(--white); }
.slw-text .hl-green { color: var(--green); font-weight: 700; }
.slw-text .hl-amber { color: var(--amber); font-weight: 700; }

.start-students-section {
  margin-bottom: 12px;
  border: 1px solid var(--b);
  border-radius: 10px; overflow: hidden;
}
.sss-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 14px; font-size: 12px; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; user-select: none;
}
.sss-header:hover { filter: brightness(1.15); }
.sss-green { background: rgba(16,185,129,0.1); color: var(--green); border-bottom: 1px solid rgba(16,185,129,0.2); }
.sss-amber { background: rgba(245,158,11,0.1);  color: var(--amber); border-bottom: 1px solid rgba(245,158,11,0.2); }
.sss-count { font-family: 'Space Mono', monospace; font-size: 12px; opacity: 0.85; }
.sss-list { max-height: 180px; overflow-y: auto; background: rgba(255,255,255,0.02); }
.sss-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 14px;
  border-bottom: 1px solid rgba(100,120,255,0.06);
  font-size: 13px;
}
.sss-item:last-child { border-bottom: none; }
.sss-item-name { font-weight: 500; flex: 1; }
.sss-item-meta { font-size: 11px; color: var(--dim); }
.sss-status {
  font-size: 10px; font-weight: 700;
  padding: 2px 8px; border-radius: 10px;
  letter-spacing: 0.04em; white-space: nowrap;
}
.sss-status.active  { background: rgba(16,185,129,0.15); color: var(--green); border: 1px solid rgba(16,185,129,0.3); }
.sss-status.waiting { background: rgba(245,158,11,0.12);  color: var(--amber); border: 1px solid rgba(245,158,11,0.3); }

.modal-actions { display: flex; gap: 10px; margin-top: 20px; }
.modal-actions .btn { flex: 1; justify-content: center; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s; border: none; }
.btn-primary { background: linear-gradient(135deg, var(--blue), var(--purple)); color: white; box-shadow: 0 0 16px rgba(79,110,247,0.3); }
.btn-primary:hover { box-shadow: 0 0 24px rgba(79,110,247,0.5); transform: translateY(-1px); }
.btn-ghost { background: rgba(255,255,255,0.05); color: var(--dim); border: 1px solid var(--b); }
.btn-ghost:hover { background: rgba(255,255,255,0.08); color: var(--white); border-color: var(--bh); }
</style>
