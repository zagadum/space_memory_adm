<template>
  <div class="modal-backdrop active" @click.self="$emit('close')">
    <div class="modal-workspace">
      <!-- Header -->
      <div class="workspace-header">
        <div class="header-content">
          <div class="header-icon">✦</div>
          <div>
            <div class="modal-title">{{ t('newGroups.create.title') }}</div>
            <div class="modal-sub">{{ t('newGroups.create.subtitle') }}</div>
          </div>
        </div>
        <div class="modal-close-btn" @click="$emit('close')">✕</div>
      </div>

      <div class="workspace-body">
        <!-- Main Form Column -->
        <div class="form-scroll-area">
          
          <!-- SECTION 1: GENERAL -->
          <div class="form-card">
            <div class="card-label">{{ t('newGroups.create.sections.general') }}</div>
            
            <!-- Type Toggle -->
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

            <!-- Name -->
            <div class="modal-field">
              <UiInput
                v-model="name"
                :label="t('newGroups.create.groupName')"
                :placeholder="t('newGroups.create.preview.empty')"
                :error="nameError"
                readonly
              />
            </div>

            <!-- Age Group -->
            <div class="modal-field">
              <div class="modal-label">{{ t('newGroups.create.ageGroup') }}</div>
              <div class="age-toggle">
                <div
                  v-for="key in (['junior', 'middle', 'senior', 'adult'] as const)"
                  :key="key"
                  :class="['age-option', selAge === key ? 'sel-' + key : '']"
                  @click="selAge = key"
                >
                  <span class="age-icon">{{ ageMap[key].icon }}</span>
                  <span class="age-range">{{ ageMap[key].label }}</span>
                  <span class="age-type">({{ t('newGroups.create.ageAdjectives.' + key) }})</span>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 2: SCHEDULE -->
          <div class="form-card">
            <div class="card-label">{{ t('newGroups.create.sections.schedule') }}</div>
            
            <!-- Timezone Picker -->
            <div class="modal-field">
              <div class="modal-label">{{ t('newGroups.create.timezoneLabel') }}</div>
              <select v-model="selTimezone" class="modal-input-raw">
                <option v-for="tz in timezones" :key="tz.id" :value="tz.id">
                  {{ tz.label }}
                </option>
              </select>
            </div>

            <div class="grid-2">
              <!-- Start Date -->
              <div class="modal-field">
                <UiInput
                  v-model="startDate"
                  type="date"
                  :label="t('newGroups.create.plannedStart')"
                />
              </div>

              <!-- Day (Readonly) -->
              <div class="modal-field">
                <div class="modal-label">{{ t('newGroups.create.lessonDay') }}</div>
                <div :class="['modal-input-readonly', dayError ? 'input-error' : '']">
                  <span v-if="day" class="day-pill">{{ day }}</span>
                  <span v-else style="opacity:0.4">{{ t('newGroups.create.selectDateFirst') }}</span>
                </div>
              </div>
            </div>

            <!-- Time Selection -->
            <div class="modal-field">
              <div class="modal-label">{{ t('newGroups.create.lessonTime') }}</div>
              <div class="time-select-group">
                <select v-model="selHour" class="modal-input-raw time-part">
                  <option v-for="h in hrs" :key="h" :value="h">{{ h }}</option>
                </select>
                <span class="time-sep">:</span>
                <select v-model="selMinute" class="modal-input-raw time-part">
                  <option v-for="m in mins" :key="m" :value="m">{{ m }}</option>
                </select>
                <div class="tz-pill">{{ timezones.find(z => z.id === selTimezone)?.label.split('(')[1]?.replace(')', '') }}</div>
              </div>
            </div>
          </div>

          <!-- SECTION 3: TEAM -->
          <div class="form-card">
            <div class="card-label">{{ t('newGroups.create.sections.team') }}</div>
            
            <!-- Teacher Search -->
            <div class="modal-field">
              <div class="modal-label">{{ t('newGroups.create.teacher') }} <span class="optional">{{ t('newGroups.create.optional') }}</span></div>
              <div class="search-select-wrapper" ref="teacherWrap">
                <input
                  v-model="teacherQuery"
                  class="modal-input-raw"
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
                </div>
              </div>
            </div>

            <!-- Students Search -->
            <div class="modal-field">
              <div class="modal-label">
                {{ t('newGroups.create.addStudents') }}
                <span class="optional">{{ t('newGroups.create.optional') }}</span>
              </div>
              
              <div class="student-search-box">
                <input
                  v-model="studentQuery"
                  class="modal-input-raw"
                  type="text"
                  :placeholder="t('newGroups.create.searchStudent')"
                  autocomplete="off"
                />
                <div class="student-list-container">
                  <div
                    v-for="s in filteredStudents"
                    :key="s.id"
                    :class="['student-check-row', selStudents.has(s.id) ? 'checked' : '']"
                    @click="toggleStudent(s.id)"
                  >
                    <div class="check-box">
                      <div class="check-inner"></div>
                    </div>
                    <div class="student-info">
                      <div class="student-name">{{ s.name }}</div>
                      <div class="student-meta">{{ s.meta }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Column (Live Preview) -->
        <div class="workspace-sidebar">
          <div class="preview-card">
            <div class="preview-title">{{ t('newGroups.create.preview.title') }}</div>
            <div class="preview-subtitle">{{ t('newGroups.create.preview.subtitle') }}</div>
            
            <div class="preview-summary">
              <!-- Name Preview -->
              <div class="preview-item">
                <div class="p-label">{{ t('newGroups.create.groupName') }}</div>
                <div class="p-value" :style="{ opacity: name ? 1 : 0.4 }">{{ name || '—' }}</div>
              </div>

              <!-- Schedule Preview -->
              <div class="preview-item">
                <div class="p-label">{{ t('newGroups.create.sections.schedule') }}</div>
                <div class="p-value" v-if="day">
                  <span class="p-day">{{ day }}</span>
                  <span class="p-time">{{ time }}</span>
                  <div class="p-tz">{{ timezones.find(z => z.id === selTimezone)?.label }}</div>
                </div>
                <div class="p-value" v-else style="opacity:0.4">{{ t('newGroups.create.selectDateFirst') }}</div>
              </div>

              <!-- Age Preview -->
              <div class="preview-item">
                <div class="p-label">{{ t('newGroups.create.ageGroup') }}</div>
                <div class="p-value" v-if="selAge">
                  <UiBadge :variant="ageVariant(selAge)">
                    {{ ageMap[selAge].icon }} {{ ageMap[selAge].label }} ({{ t('newGroups.create.ageAdjectives.' + selAge) }})
                  </UiBadge>
                </div>
                <div class="p-value" v-else style="opacity:0.4">—</div>
              </div>

              <!-- Teacher Preview -->
              <div class="preview-item">
                <div class="p-label">{{ t('newGroups.create.teacher') }}</div>
                <div class="p-value">{{ selectedTeacherName }}</div>
              </div>

              <!-- Students Preview -->
              <div class="preview-item">
                <div class="p-label">{{ t('newGroups.create.addStudents') }}</div>
                <div class="p-value">
                  <UiBadge v-if="selStudents.size > 0" variant="purple">
                    {{ t('newGroups.create.preview.selected', { n: selStudents.size }) }}
                  </UiBadge>
                  <span v-else style="opacity:0.4">{{ t('newGroups.create.preview.noStudents') }}</span>
                </div>
              </div>
            </div>

            <div class="preview-footer">
              <UiButton variant="neutral" @click="$emit('close')">{{ t('newGroups.create.cancel') }}</UiButton>
              <UiButton variant="primary" :disabled="!isReady" @click="submit" :loading="isLoading">
                {{ t('newGroups.create.submit') }}
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { NewGroupTeacher, MasterStudent } from '../../../api/newGroupsApi'
import { ageMap } from '../../../utils/newGroupsUtils'
import UiInput from '../../../components/ui/UiInput.vue'
import UiButton from '../../../components/ui/UiButton.vue'
import UiBadge from '../../../components/ui/UiBadge.vue'

const props = defineProps<{
  teachers: NewGroupTeacher[]
  allStudents: MasterStudent[]
}>()

const emit = defineEmits<{
  close: []
  created: [payload: {
    name: string
    type: 'group' | 'individual'
    day: string
    time: string
    startDate: string
    timezone: string
    age: string | null
    teacherId: number | null
    studentIds: number[]
  }]
}>()

const { t } = useI18n()

// ── State ──
const isLoading = ref(false)
const selType = ref<'group' | 'individual'>('group')
const name = ref('')
const nameError = ref('')
const selAge = ref<string | null>(null)
const selTimezone = ref('Europe/Warsaw')
const startDate = ref('')
const day = ref('')
const dayError = ref('')
const selHour = ref('17')
const selMinute = ref('00')
const teacherQuery = ref('')
const teacherId = ref<number | null>(null)
const teacherOpen = ref(false)
const studentQuery = ref('')
const selStudents = ref<Set<number>>(new Set())

// ── Constants ──
const timezones = [
  { id: 'Europe/Warsaw', label: t('newGroups.create.timezones.warsaw') },
  { id: 'Europe/Kyiv', label: t('newGroups.create.timezones.kyiv') },
  { id: 'Europe/London', label: t('newGroups.create.timezones.london') },
  { id: 'America/New_York', label: t('newGroups.create.timezones.new_york') },
  { id: 'America/Chicago', label: t('newGroups.create.timezones.chicago') },
  { id: 'America/Los_Angeles', label: t('newGroups.create.timezones.los_angeles') },
]

const weekdays = [
  t('newGroups.weekdays.mon'),
  t('newGroups.weekdays.tue'),
  t('newGroups.weekdays.wed'),
  t('newGroups.weekdays.thu'),
  t('newGroups.weekdays.fri'),
  t('newGroups.weekdays.sat'),
  t('newGroups.weekdays.sun'),
]

const hrs = Array.from({ length: 15 }, (_, i) => String(i + 7).padStart(2, '0'))
const mins = ['00', '15', '30', '45']

// ── Constants ──
const ageKeys = ['junior', 'middle', 'senior', 'adult'] as const

// ── Computed ──
const time = computed(() => `${selHour.value}:${selMinute.value}`)

const filteredTeachers = computed(() => {
  const q = teacherQuery.value.toLowerCase()
  if (!q) return props.teachers.slice(0, 10)
  return props.teachers.filter(t => t.name.toLowerCase().includes(q))
})

const filteredStudents = computed(() => {
  const q = studentQuery.value.toLowerCase()
  if (!q) return props.allStudents.slice(0, 20)
  return props.allStudents.filter(s => s.name.toLowerCase().includes(q))
})

const selectedTeacherName = computed(() => {
  if (!teacherId.value) return t('newGroups.create.preview.noTeacher')
  return props.teachers.find(t => t.id === teacherId.value)?.name || ''
})

const isReady = computed(() => {
  return name.value.trim().length > 0 && day.value.length > 0 && startDate.value.length > 0
})

function ageVariant(key: string): "success" | "warning" | "danger" | "info" | "default" {
  if (key === 'junior') return 'success'
  if (key === 'middle') return 'warning'
  if (key === 'senior') return 'danger'
  if (key === 'adult')  return 'info'
  return 'default'
}

// ── Logic ──
const shortWeekdays = {
  0: t('newGroups.create.shortWeekdays.sun'),
  1: t('newGroups.create.shortWeekdays.mon'),
  2: t('newGroups.create.shortWeekdays.tue'),
  3: t('newGroups.create.shortWeekdays.wed'),
  4: t('newGroups.create.shortWeekdays.thu'),
  5: t('newGroups.create.shortWeekdays.fri'),
  6: t('newGroups.create.shortWeekdays.sat'),
}

function deriveTeacherShort(fullName: string): string {
  if (!fullName) return ''
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[1].slice(0, 2) : ''
  return (first + last).toUpperCase() // or as is? Example was "ЕЛа". I'll try to preserve case if possible.
  // Actually, let's do: First initial (Upper) + next chars (Lower if they were lower)
  // Example: Elena Lazareva -> E + La -> ELa.
  // parts[0][0] + parts[1].slice(0, 2)
  if (parts.length > 1) {
    return parts[0][0].toUpperCase() + parts[1][0].toUpperCase() + (parts[1][1] || '').toLowerCase()
  }
  return parts[0].slice(0, 3).toUpperCase()
}

const autoName = computed(() => {
  let res = ''
  
  // 1. Day
  if (startDate.value) {
    const d = new Date(startDate.value + 'T00:00:00Z')
    if (!isNaN(d.getTime())) {
      res += shortWeekdays[d.getUTCDay() as keyof typeof shortWeekdays] || ''
    }
  }

  // 2. Hour
  if (selHour.value) {
    res += (res ? ' ' : '') + selHour.value
  }

  // 3. Age
  if (selAge.value) {
    const adjKey = `newGroups.create.ageAdjectives.${selAge.value}`
    res += (res ? ' ' : '') + t(adjKey)
  }

  // 4. Teacher
  if (teacherId.value) {
    const teacher = props.teachers.find(t => t.id === teacherId.value)
    if (teacher) {
      res += (res ? ' ' : '') + deriveTeacherShort(teacher.name)
    }
  }

  return res
})

watch(autoName, (newVal) => {
  name.value = newVal
}, { immediate: true })

watch(startDate, (newVal) => {
  if (!newVal) {
    day.value = ''
    return
  }
  // Force UTC parsing to avoid locale shifts
  const d = new Date(newVal + 'T00:00:00Z')
  if (isNaN(d.getTime())) return
  const jsDay = d.getUTCDay() // 0=Sun, 1=Mon...
  const idx = (jsDay + 6) % 7
  day.value = weekdays[idx]
  dayError.value = ''
}, { immediate: true })

function toggleStudent(id: number) {
  if (selStudents.value.has(id)) selStudents.value.delete(id)
  else selStudents.value.add(id)
}

function onTeacherInput() {
  teacherId.value = null
  teacherOpen.value = true
}

function selectTeacher(t: NewGroupTeacher) {
  teacherId.value = t.id
  teacherQuery.value = t.name
  teacherOpen.value = false
}

function submit() {
  nameError.value = name.value.trim() ? '' : 'required'
  dayError.value = day.value ? '' : 'required'
  if (!name.value.trim() || !day.value) return

  isLoading.value = true
  emit('created', {
    name: name.value,
    type: selType.value,
    day: day.value,
    time: time.value,
    startDate: startDate.value,
    timezone: selTimezone.value,
    age: selAge.value,
    teacherId: teacherId.value,
    studentIds: Array.from(selStudents.value)
  })
}

// ── Outside Click for Search ──
const teacherWrap = ref<HTMLElement | null>(null)
function handleOutside(e: MouseEvent) {
  if (teacherWrap.value && !teacherWrap.value.contains(e.target as Node)) {
    teacherOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', handleOutside))
onUnmounted(() => document.removeEventListener('click', handleOutside))
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(10, 11, 20, 0.7);
  backdrop-filter: blur(12px);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

.modal-workspace {
  background: var(--card);
  border: 1px solid var(--bh);
  border-radius: 24px;
  width: 960px;
  max-width: calc(100vw - 40px);
  height: 85vh;
  display: flex; flex-direction: column;
  box-shadow: 0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(79,110,247,0.1);
  overflow: hidden;
  position: relative;
}

/* Glass Header */
.workspace-header {
  padding: 20px 28px;
  border-bottom: 1px solid var(--b);
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,255,255,0.02);
  flex-shrink: 0;
}
.header-content { display: flex; align-items: center; gap: 16px; }
.header-icon {
  width: 42px; height: 42px; border-radius: 12px;
  background: linear-gradient(135deg, var(--blue), var(--purple));
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: white;
  box-shadow: 0 0 15px rgba(79,110,247,0.4);
}
.modal-title { font-size: 20px; font-weight: 700; color: var(--white); }
.modal-sub { font-size: 13px; color: var(--dim); margin-top: 2px; }

.modal-close-btn {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; background: rgba(255,255,255,0.05); color: var(--dim);
  transition: all 0.2s; border: 1px solid transparent;
}
.modal-close-btn:hover { background: rgba(239, 68, 68, 0.15); color: var(--red); border-color: rgba(239,68,68,0.2); }

/* Body Layout */
.workspace-body {
  flex: 1; display: flex; overflow: hidden;
}

.form-scroll-area {
  flex: 1; padding: 28px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 24px;
}

.form-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--b);
  border-radius: 16px; padding: 20px;
  position: relative; transition: all 0.3s;
}
.form-card:hover { border-color: var(--bh); background: rgba(255,255,255,0.04); }

.card-label {
  position: absolute; top: -10px; left: 16px;
  background: var(--card); padding: 0 8px;
  font-size: 11px; font-weight: 700; color: var(--blue);
  text-transform: uppercase; letter-spacing: 0.1em;
}

/* Fields */
.modal-field { margin-bottom: 20px; }
.modal-label {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  color: var(--dim); margin-bottom: 8px; letter-spacing: 0.05em;
  display: flex; align-items: center; gap: 6px;
}
.modal-input-raw {
  width: 100%; height: 42px; border-radius: 10px;
  background: rgba(255,255,255,0.04); border: 1px solid var(--b);
  padding: 0 14px; color: var(--white); font-size: 14px;
  transition: all 0.2s; outline: none;
}
.modal-input-raw:focus { border-color: var(--blue); background: rgba(255,255,255,0.07); box-shadow: 0 0 15px rgba(79,110,247,0.1); }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.modal-input-readonly {
  width: 100%; height: 42px; border-radius: 10px;
  background: rgba(255,255,255,0.02); border: 1px solid var(--b);
  padding: 0 14px; display: flex; align-items: center; color: var(--dim);
}
.day-pill {
  background: rgba(79,110,247,0.15); color: var(--blue);
  padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px;
}

/* Controls */
.modal-type-toggle { display: flex; gap: 10px; }
.type-option {
  flex: 1; padding: 12px; border-radius: 12px;
  background: rgba(255,255,255,0.03); border: 1px solid var(--b);
  cursor: pointer; text-align: center; transition: all 0.2s;
  color: var(--dim); font-size: 14px; font-weight: 500;
}
.type-option.selected {
  background: rgba(79,110,247,0.1); border-color: var(--blue); color: var(--white);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}
.type-icon { font-size: 20px; display: block; margin-bottom: 4px; }

.age-toggle { display: flex; gap: 10px; flex-wrap: wrap; }
.age-option {
  padding: 8px 14px; border-radius: 8px; border: 1px solid var(--b);
  background: rgba(255,255,255,0.02); cursor: pointer;
  font-size: 13px; color: var(--dim); transition: all 0.2s;
}
.age-option:hover { border-color: var(--bh); color: var(--white); }
.age-option.sel-junior { background: rgba(16,185,129,0.1); border-color: var(--green); color: var(--green); }
.age-option.sel-middle { background: rgba(245,158,11,0.1); border-color: var(--amber); color: var(--amber); }
.age-option.sel-senior { background: rgba(239,68,68,0.1); border-color: var(--red); color: var(--red); }
.age-option.sel-adult  { background: rgba(139,92,246,0.1); border-color: var(--purple); color: var(--purple); }

.age-range { font-weight: 700; margin-right: 4px; }
.age-type { opacity: 0.8; font-weight: 400; font-size: 11px; }
.age-icon { margin-right: 6px; }

/* Time */
.time-select-group { display: flex; align-items: center; gap: 8px; }
.time-part { width: 70px; text-align: center; }
.time-sep { font-size: 20px; font-weight: 700; color: var(--dim); }
.tz-pill {
  padding: 4px 12px; border-radius: 20px; background: var(--bh);
  font-size: 11px; color: var(--dim); font-weight: 600; margin-left: auto;
}

/* Student Search */
.student-search-box { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--b); }
.student-list-container {
  height: 200px; overflow-y: auto; background: rgba(0,0,0,0.1);
}
.student-check-row {
  padding: 10px 14px; display: flex; align-items: center; gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: all 0.2s;
}
.student-check-row:hover { background: rgba(255,255,255,0.03); }
.student-check-row.checked { background: rgba(79,110,247,0.05); }

.check-box {
  width: 20px; height: 20px; border-radius: 6px;
  border: 1.5px solid var(--bh); display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.student-check-row.checked .check-box { background: var(--blue); border-color: var(--blue); }
.check-inner { width: 6px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); display: none; margin-bottom: 2px; }
.student-check-row.checked .check-inner { display: block; }

.student-name { font-size: 14px; font-weight: 500; color: var(--white); }
.student-meta { font-size: 12px; color: var(--dim); margin-top: 1px; }

/* Sidebar */
.workspace-sidebar {
  width: 320px; height: 100%; border-left: 1px solid var(--b);
  background: rgba(255,255,255,0.015); padding: 28px;
  display: flex; flex-direction: column;
}
.preview-card { flex: 1; display: flex; flex-direction: column; }
.preview-title { font-size: 13px; font-weight: 700; color: var(--white); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
.preview-subtitle { font-size: 12px; color: var(--dim); margin-bottom: 32px; }

.preview-summary { flex: 1; display: flex; flex-direction: column; gap: 24px; }
.preview-item { border-left: 2px solid var(--bh); padding-left: 16px; }
.p-label { font-size: 11px; font-weight: 600; color: var(--dim); text-transform: uppercase; margin-bottom: 6px; }
.p-value { font-size: 15px; font-weight: 500; color: var(--white); min-height: 22px; }

.p-day { color: var(--blue); font-weight: 700; margin-right: 8px; }
.p-time { font-family: 'Space Mono', monospace; }
.p-tz { font-size: 11px; color: var(--dim); margin-top: 4px; }

.preview-footer { margin-top: auto; display: flex; flex-direction: column; gap: 12px; }
.preview-footer .btn { width: 100%; height: 48px; justify-content: center; font-size: 14px; font-weight: 600; border-radius: 12px; }

/* Search Dropdown */
.search-select-wrapper { position: relative; }
.search-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: var(--app-card); border: 1px solid var(--bh);
  border-radius: 12px; max-height: 200px; overflow-y: auto;
  z-index: 1100; display: none; box-shadow: 0 10px 40px rgba(0,0,0,0.6);
}
.search-dropdown.open { display: block; }
.search-dropdown-item { padding: 12px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; }
.search-dropdown-item:hover { background: rgba(79,110,247,0.1); }
.mini-dot {
  width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: white; border: 1px solid rgba(255,255,255,0.1);
  flex-shrink: 0;
}

/* Animations */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }

.input-error { border-color: var(--red) !important; box-shadow: 0 0 10px rgba(239, 68, 68, 0.2) !important; }

.optional { font-size: 9px; opacity: 0.5; margin-left: 4px; }
</style>
