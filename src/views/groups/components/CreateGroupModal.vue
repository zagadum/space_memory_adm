<template>
  <div class="modal-backdrop active" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-close-btn" @click="$emit('close')">✕</div>
      <div class="modal-title">{{ t('newGroups.create.title') }}</div>
      <div class="modal-sub">{{ t('newGroups.create.subtitle') }}</div>

      <!-- Тип -->
      <div class="modal-field">
        <div class="modal-label">{{ t('newGroups.create.groupType') }}</div>
        <div class="modal-type-toggle">
          <div :class="['type-option', selType === 'individual' ? 'selected' : '']" @click="selType = 'individual'">
            <span class="type-icon">👤</span>{{ t('newGroups.create.individual') }}
          </div>
          <div :class="['type-option', selType === 'group' ? 'selected' : '']" @click="selType = 'group'">
            <span class="type-icon">👥</span>{{ t('newGroups.create.group') }}
          </div>
        </div>
      </div>

      <!-- Название -->
      <div class="modal-field">
        <div class="modal-label">{{ t('newGroups.create.groupName') }}</div>
        <input
          v-model="name"
          :class="['modal-input', nameError ? 'input-error' : '']"
          type="text"
          :placeholder="t('newGroups.create.namePlaceholder')"
        />
      </div>

      <!-- День + Время -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="modal-field">
          <div class="modal-label">{{ t('newGroups.create.lessonDay') }}</div>
          <select v-model="day" :class="['modal-input', dayError ? 'input-error' : '']">
            <option value="">{{ t('newGroups.create.selectDay') }}</option>
            <option v-for="d in days" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <div class="modal-field">
          <div class="modal-label">{{ t('newGroups.create.lessonTime') }}</div>
          <input v-model="time" type="time" class="modal-input" />
        </div>
      </div>

      <!-- Дата старта -->
      <div class="modal-field">
        <div class="modal-label">{{ t('newGroups.create.plannedStart') }}</div>
        <input v-model="startDate" type="date" class="modal-input" />
      </div>

      <!-- Возраст -->
      <div class="modal-field">
        <div class="modal-label">{{ t('newGroups.create.ageGroup') }}</div>
        <div class="age-toggle">
          <div
            v-for="(info, key) in ageMap"
            :key="key"
            :class="['age-option', selAge === key ? 'sel-' + key : '']"
            @click="selAge = key"
          >{{ info.icon }} {{ info.label }}</div>
        </div>
      </div>

      <!-- Учитель -->
      <div class="modal-field">
        <div class="modal-label">{{ t('newGroups.create.teacher') }} <span class="optional">{{ t('newGroups.create.optional') }}</span></div>
        <div class="search-select-wrapper" ref="teacherWrap">
          <input
            v-model="teacherQuery"
            class="modal-input"
            type="text"
            :placeholder="t('newGroups.create.searchTeacher')"
            autocomplete="off"
            @focus="teacherOpen = true"
            @input="onTeacherInput"
          />
          <div :class="['search-dropdown', teacherOpen ? 'open' : '']">
            <div
              v-for="t in filteredTeachers"
              :key="t.id"
              class="search-dropdown-item"
              @click="selectTeacher(t)"
            >
              <div class="mini-dot" :style="{ background: t.color }">{{ t.initials }}</div>
              <span>{{ t.name }}</span>
            </div>
            <div v-if="!filteredTeachers.length" style="padding:10px 12px;font-size:13px;color:var(--dim)">{{ t('newGroups.create.notFound') }}</div>
          </div>
        </div>
      </div>

      <!-- Ученики -->
      <div class="modal-field">
        <div class="modal-label">
          {{ t('newGroups.create.addStudents') }}
          <span class="optional">{{ t('newGroups.create.optional') }}</span>
          <span v-if="selStudents.size > 0" class="sel-count-pill">{{ t('newGroups.create.selectedCount', { n: selStudents.size }) }}</span>
        </div>
        <input
          v-model="studentQuery"
          class="modal-input"
          type="text"
          :placeholder="t('newGroups.create.searchStudent')"
          autocomplete="off"
          style="margin-bottom:0"
        />
        <div class="student-list-box">
          <div
            v-for="s in filteredStudents"
            :key="s.id"
            :class="['student-check-item', selStudents.has(s.id) ? 'checked' : '']"
            @click="toggleStudent(s.id)"
          >
            <div class="custom-checkbox"></div>
            <div style="flex:1">
              <div class="student-check-name">{{ s.name }}</div>
              <div class="student-check-meta">{{ s.meta }}</div>
            </div>
          </div>
          <div v-if="!filteredStudents.length" style="padding:12px;color:var(--dim);font-size:13px;text-align:center">{{ t('newGroups.create.notFound') }}</div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-ghost" @click="$emit('close')">{{ t('newGroups.create.cancel') }}</button>
        <button class="btn btn-primary" @click="submit">{{ t('newGroups.create.submit') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { NewGroupTeacher, MasterStudent } from '../../../api/newGroupsApi'

const { t } = useI18n()

const props = defineProps<{
  teachers: NewGroupTeacher[]
  allStudents: MasterStudent[]
}>()

const emit = defineEmits<{
  close: []
  created: [payload: { name: string; type: 'group' | 'individual'; day: string; time: string; startDate: string; age: string | null; teacherId: number | null; studentIds: number[] }]
}>()

// Form state
const selType = ref<'group' | 'individual'>('group')
const name = ref('')
const day = ref('')
const time = ref('16:00')
const startDate = ref('')
const selAge = ref<string | null>(null)
const teacherQuery = ref('')
const selTeacherId = ref<number | null>(null)
const teacherOpen = ref(false)
const studentQuery = ref('')
const selStudents = ref<Set<number>>(new Set())
const nameError = ref(false)
const dayError = ref(false)
const teacherWrap = ref<HTMLElement | null>(null)

const days = [
  t('newGroups.weekdays.mon'),
  t('newGroups.weekdays.tue'),
  t('newGroups.weekdays.wed'),
  t('newGroups.weekdays.thu'),
  t('newGroups.weekdays.fri'),
  t('newGroups.weekdays.sat'),
  t('newGroups.weekdays.sun'),
]

const ageMap: Record<string, { label: string; icon: string }> = {
  junior: { label: '5–7',   icon: '🟢' },
  middle: { label: '8–10',  icon: '🟡' },
  senior: { label: '11–14', icon: '🔴' },
  adult:  { label: '15+',   icon: '🟣' },
}

const filteredTeachers = computed(() => {
  const q = teacherQuery.value.toLowerCase()
  return q ? props.teachers.filter(t => t.name.toLowerCase().includes(q)) : props.teachers
})

const filteredStudents = computed(() => {
  const q = studentQuery.value.toLowerCase()
  return q ? props.allStudents.filter(s => s.name.toLowerCase().includes(q)) : props.allStudents
})

function onTeacherInput() {
  selTeacherId.value = null
  teacherOpen.value = true
}

function selectTeacher(t: NewGroupTeacher) {
  selTeacherId.value = t.id
  teacherQuery.value = t.name
  teacherOpen.value = false
}

function toggleStudent(id: number) {
  const s = new Set(selStudents.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selStudents.value = s
}

function validateField(val: string, errRef: { value: boolean }) {
  if (!val.trim()) {
    errRef.value = true
    setTimeout(() => errRef.value = false, 1800)
    return false
  }
  return true
}

function submit() {
  const okName = validateField(name.value, nameError)
  const okDay  = validateField(day.value, dayError)
  if (!okName || !okDay) return

  const sd = startDate.value || (() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().slice(0, 10)
  })()

  emit('created', {
    name: name.value.trim(),
    type: selType.value,
    day: day.value,
    time: time.value,
    startDate: sd,
    age: selAge.value,
    teacherId: selTeacherId.value,
    studentIds: [...selStudents.value],
  })
}

// Close dropdown on outside click
function handleOutsideClick(e: MouseEvent) {
  if (teacherWrap.value && !teacherWrap.value.contains(e.target as Node)) {
    teacherOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  z-index: 500;
  display: flex; align-items: center; justify-content: center;
}

.modal {
  background: var(--card);
  border: 1px solid var(--bh);
  border-radius: 16px;
  padding: 28px;
  width: 560px;
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
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--b);
  color: var(--dim); font-size: 14px;
  transition: all 0.15s;
}
.modal-close-btn:hover { background: rgba(239,68,68,0.15); color: var(--red); }

.modal-title { font-size: 18px; font-weight: 700; margin-bottom: 4px; padding-right: 36px; }
.modal-sub { font-size: 12.5px; color: var(--dim); margin-bottom: 20px; }
.modal-field { margin-bottom: 16px; }
.modal-label {
  font-size: 11.5px; font-weight: 600; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--dim);
  margin-bottom: 7px; display: flex; align-items: center; gap: 6px;
}
.modal-label .optional { font-size: 10px; font-weight: 400; text-transform: none; letter-spacing: 0; color: rgba(136,146,176,0.55); }

.modal-input {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--b);
  border-radius: 8px;
  padding: 9px 12px;
  color: var(--white);
  font-family: 'Outfit', sans-serif;
  font-size: 13.5px;
  outline: none;
  transition: all 0.2s;
  appearance: none;
}
.modal-input:focus { border-color: var(--bh); background: rgba(255,255,255,0.06); box-shadow: 0 0 12px rgba(79,110,247,0.1); }
.modal-input option { background: var(--app-surface); color: var(--text-main); }
.input-error { border-color: var(--red) !important; box-shadow: 0 0 8px rgba(239,68,68,0.2) !important; }

.modal-type-toggle { display: flex; gap: 8px; }
.type-option {
  flex: 1; padding: 10px; border-radius: 8px;
  border: 1px solid var(--b);
  background: rgba(255,255,255,0.03);
  cursor: pointer; text-align: center;
  font-size: 13px; font-weight: 500; color: var(--dim);
  transition: all 0.2s; user-select: none;
}
.type-option:hover { border-color: var(--bh); color: var(--white); }
.type-option.selected {
  background: linear-gradient(135deg, rgba(79,110,247,0.2), rgba(139,92,246,0.15));
  border-color: rgba(79,110,247,0.5); color: var(--white);
  box-shadow: 0 0 12px rgba(79,110,247,0.15);
}
.type-icon { font-size: 18px; display: block; margin-bottom: 4px; }

.age-toggle { display: flex; gap: 8px; flex-wrap: wrap; }
.age-option {
  flex: 1; min-width: 80px; padding: 8px 6px;
  border-radius: 8px; border: 1px solid var(--b);
  background: rgba(255,255,255,0.03);
  cursor: pointer; text-align: center;
  font-size: 12.5px; font-weight: 500; color: var(--dim);
  transition: all 0.2s; user-select: none;
}
.age-option:hover { border-color: var(--bh); color: var(--white); }
.age-option.sel-junior { background: rgba(16,185,129,0.18);  border-color: rgba(16,185,129,0.5);  color: var(--green); }
.age-option.sel-middle { background: rgba(245,158,11,0.18);  border-color: rgba(245,158,11,0.5);  color: var(--amber); }
.age-option.sel-senior { background: rgba(239,68,68,0.18);   border-color: rgba(239,68,68,0.5);   color: var(--red); }
.age-option.sel-adult  { background: rgba(139,92,246,0.18);  border-color: rgba(139,92,246,0.5);  color: var(--purple); }

.search-select-wrapper { position: relative; }
.search-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: var(--app-surface);
  border: 1px solid var(--bh);
  border-radius: 8px; max-height: 200px; overflow-y: auto;
  z-index: 700; display: none;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}
.search-dropdown.open { display: block; }
.search-dropdown-item {
  padding: 9px 12px; font-size: 13px; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: background 0.15s;
}
.search-dropdown-item:hover { background: rgba(79,110,247,0.1); }

.mini-dot {
  width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 700; flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.1);
}

.student-list-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--b);
  border-radius: 8px;
  max-height: 210px;
  overflow-y: auto;
  margin-top: 8px;
}
.student-check-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px;
  border-bottom: 1px solid rgba(100,120,255,0.07);
  cursor: pointer; transition: background 0.15s; user-select: none;
}
.student-check-item:last-child { border-bottom: none; }
.student-check-item:hover { background: rgba(79,110,247,0.07); }

.custom-checkbox {
  width: 18px; height: 18px; border-radius: 5px;
  border: 1.5px solid var(--bh);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.15s;
  background: rgba(255,255,255,0.03);
}
.student-check-item.checked .custom-checkbox {
  background: linear-gradient(135deg, var(--blue), var(--purple));
  border-color: transparent;
}
.custom-checkbox::after { content: '✓'; font-size: 11px; color: white; display: none; }
.student-check-item.checked .custom-checkbox::after { display: block; }

.student-check-name { font-size: 13px; font-weight: 500; }
.student-check-meta { font-size: 11px; color: var(--dim); }

.sel-count-pill {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(79,110,247,0.15);
  border: 1px solid rgba(79,110,247,0.3);
  color: var(--blue); font-size: 11px; font-weight: 600;
  padding: 2px 8px; border-radius: 10px;
  font-family: 'Space Mono', monospace;
}

.modal-actions { display: flex; gap: 10px; margin-top: 20px; }
.modal-actions .btn { flex: 1; justify-content: center; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s; border: none; }
.btn-primary { background: linear-gradient(135deg, var(--blue), var(--purple)); color: white; box-shadow: 0 0 16px rgba(79,110,247,0.3); }
.btn-primary:hover { box-shadow: 0 0 24px rgba(79,110,247,0.5); transform: translateY(-1px); }
.btn-ghost { background: rgba(255,255,255,0.05); color: var(--dim); border: 1px solid var(--b); }
.btn-ghost:hover { background: rgba(255,255,255,0.08); color: var(--white); border-color: var(--bh); }
</style>
