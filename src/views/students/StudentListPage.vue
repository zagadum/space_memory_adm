<template>
  <div class="content">
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-label">Активных учеников</div>
        <div class="stat-value">{{ students.length }}</div>
        <div class="stat-sub">всего в системе</div>
        <div class="stat-icon">👩‍🚀</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Оплачено сейчас</div>
        <div class="stat-value">{{ students.filter(s => s.paid).length }}</div>
        <div class="stat-sub"><span class="up">↑ активные</span></div>
        <div class="stat-icon">✅</div>
      </div>
      <div class="stat-card amber">
        <div class="stat-label">Среднее обучение</div>
        <div class="stat-value">124</div>
        <div class="stat-sub"><span class="warn">дней средний срок</span></div>
        <div class="stat-icon">⏱</div>
      </div>
      <div class="stat-card cyan">
        <div class="stat-label">Без контакта 7+ дней</div>
        <div class="stat-value">{{ students.filter(s => s.daysSinceContact >= 7).length }}</div>
        <div class="stat-sub">требуют внимания</div>
        <div class="stat-icon">⚠️</div>
      </div>
    </div>

    <div class="table-toolbar">
      <div class="toolbar-left">
        <div class="section-title">
          Список учеников
          <span class="section-count">{{ students.length }} учеников</span>
        </div>
        <div class="filter-chips">
          <div class="chip">
            <span class="chip-dot amber"></span> Без контакта 7+ дней
          </div>
          <div class="chip">
            <span class="chip-dot blue"></span> Только мои
          </div>
        </div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="dropdown-filter-btn">Группа ▾</button>
        <button class="dropdown-filter-btn">Учитель ▾</button>
      </div>
    </div>

    <div class="table-container">
      <table id="studentsTable">
        <thead>
          <tr>
            <th @click="sortBy('name')" style="cursor:pointer; user-select:none">
              Имя Фамилия <span class="sort-icon" :style="{ color: sortCol === 'name' ? 'var(--blue)' : 'inherit' }">{{ sortCol === 'name' ? (sortDir === 1 ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('startDate')" style="cursor:pointer; user-select:none">
              Дата старта <span class="sort-icon" :style="{ color: sortCol === 'startDate' ? 'var(--blue)' : 'inherit' }">{{ sortCol === 'startDate' ? (sortDir === 1 ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('daysInSystem')" style="cursor:pointer; user-select:none">
              Срок обучения <span class="sort-icon" :style="{ color: sortCol === 'daysInSystem' ? 'var(--blue)' : 'inherit' }">{{ sortCol === 'daysInSystem' ? (sortDir === 1 ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>Школа</th>
            <th>Учитель</th>
            <th>Группа</th>
            <th @click="sortBy('lastContact')" style="cursor:pointer; user-select:none">
              Последний контакт <span class="sort-icon" :style="{ color: sortCol === 'lastContact' ? 'var(--blue)' : 'inherit' }">{{ sortCol === 'lastContact' ? (sortDir === 1 ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>Кто общался</th>
            <th class="comment-header">Последний комментарий</th>
            <th class="actions-header">···</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in sortedStudents" :key="student.id" class="table-row" @click="openStudent(student.id)">
            <td>
              <div class="name-cell">
                <span class="student-name">{{ student.name }}</span>
                <span class="student-meta">{{ student.phone }}</span>
              </div>
            </td>
            <td><span class="date-mono">{{ student.startDate || "—" }}</span></td>
            <td>
              <div class="timer-cell">
                <span class="timer-days" :class="{ 'high-alert': (student.daysSinceContact || 0) > 10 }">
                  {{ student.daysInSystem || 0 }}
                </span>
                <span class="timer-label">дней</span>
              </div>
            </td>
            <td>
              <div class="enrollment-list">
                <div v-for="(enr, i) in student.enrollments" :key="i" class="enrollment-item school-name">
                  {{ enr.school }}
                </div>
              </div>
            </td>
            <td>
              <div class="enrollment-list">
                <div v-for="(enr, i) in student.enrollments" :key="i" class="enrollment-item">
                  {{ enr.teacher }}
                </div>
              </div>
            </td>
            <td>
              <div class="enrollment-list">
                <div v-for="(enr, i) in student.enrollments" :key="i" class="enrollment-item group-cell">
                  <span class="group-dot" :style="{ background: student.groupColor || '#4f6ef7' }"></span>
                  <span class="group-name">{{ enr.group }}</span>
                </div>
              </div>
            </td>
            <!-- 6: Последний контакт -->
            <td>
              <div class="last-contact-cell">
                <span class="date-mono">{{ student.lastContact || "—" }}</span>
                <button class="contact-edit-btn" @click.stop="openContactModal(student)">✎</button>
              </div>
            </td>
            <td>
              <div class="person-cell">
                <div class="mini-avatar" :style="{ background: student.avatarColor || '#4f6ef7' }">{{ student.staffInitials || "—" }}</div>
                <span class="person-name">{{ student.staff || "—" }}</span>
              </div>
            </td>
            <td>
              <div class="comment-cell">{{ student.comment || "—" }}</div>
            </td>
            <td>
              <div class="actions-wrap" @click.stop>
                <button class="actions-btn" @click="toggleDropdown(student.id)">⋮</button>
                <div class="actions-dropdown" :class="{ open: activeDropdownId === student.id }">
                  <div class="action-item" @click="openStudent(student.id); activeDropdownId = null">👤 Открыть профиль</div>
                  <div class="action-item" @click="openContactModal(student); activeDropdownId = null">📅 Обновить контакт</div>
                  <div class="action-item" @click="activeDropdownId = null">👤 Сменить куратора</div>
                  <div class="action-item" @click="activeDropdownId = null">📧 Отправить Email</div>
                  <div class="action-item danger" @click="activeDropdownId = null">📦 В архив</div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно "Контакт" -->
    <div class="modal-backdrop" :class="{ active: isContactModalOpen }" @click.self="closeContactModal">
      <div class="modal">
        <div class="popup-title">Редактировать контакт: {{ editingStudent?.name }}</div>
        <div class="popup-sub">Обновите дату последнего контакта и добавьте комментарий</div>

        <div class="popup-label-row">
          <label class="popup-label">Дата и время контакта</label>
          <button class="quick-date-btn" @click="setNow">⚡ Только что</button>
        </div>
        <input type="datetime-local" v-model="contactDateTimeForm" class="modal-input">

        <label class="popup-label">Комментарий</label>
        <input type="text" v-model="contactCommentForm" class="popup-input" placeholder="Введите текст...">

        <div class="popup-actions">
          <button class="btn btn-ghost" @click="closeContactModal">Отмена</button>
          <button class="btn btn-primary" @click="saveContact">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { TEACHERS_DB } from '../../api/mockDb'

const router = useRouter()

function openStudent(id: number | string) {
  router.push({ name: 'student-payments', params: { id: id.toString() } })
}

// Моковые данные
const students = ref([
  {
    id: 's_1',
    name: 'Иван Иванов',
    phone: '+48 777 000 111',
    startDate: '01.09.2023',
    daysInSystem: 124,
    enrollments: [
      { school: 'Space Memory', group: 'Вт 17 Младшая', teacher: 'Клара Левит' },
      { school: 'Speedy Mind Indigo', group: 'Ср 15 Младшая', teacher: 'Ханна Боян' }
    ],
    groupColor: '#4f6ef7',
    lastContact: 'Вчера',
    daysSinceContact: 1,
    staff: 'Артём',
    staffInitials: 'АР',
    avatarColor: '#f59e0b',
    comment: 'Отправил договор',
    paid: true
  },
  {
    id: 's_2',
    name: 'Мария Смирнова',
    phone: '+48 987 654 321',
    startDate: '15.08.2023',
    daysInSystem: 140,
    enrollments: [
      { school: 'Speedy Mind Indigo', group: 'Ср 15 Младшая', teacher: 'Пиотр Ивановски' }
    ],
    groupColor: '#10b981',
    lastContact: '3 дня назад',
    daysSinceContact: 3,
    staff: 'Светлана',
    staffInitials: 'СВ',
    avatarColor: '#8b5cf6',
    comment: 'Всё отлично, мама довольна',
    paid: true
  },
  {
    id: 's_3',
    name: 'Кирилл Козлов',
    phone: '+48 111 222 333',
    startDate: '10.01.2024',
    daysInSystem: 45,
    enrollments: [
      { school: 'Space Memory', group: 'Пт 19 Старшая', teacher: 'Анна Новак' }
    ],
    groupColor: '#f59e0b',
    lastContact: '10 дней назад',
    daysSinceContact: 10,
    staff: 'Артём',
    staffInitials: 'АР',
    avatarColor: '#f59e0b',
    comment: 'Не берет трубку',
    paid: false
  }
])

// ── СОРТИРОВКА ──
const sortCol = ref('name')
const sortDir = ref(1) // 1 - asc, -1 - desc

function sortBy(col: string) {
  if (sortCol.value === col) {
    sortDir.value *= -1
  } else {
    sortCol.value = col
    sortDir.value = 1
  }
}

const sortedStudents = computed(() => {
  return [...students.value].sort((a: any, b: any) => {
    let valA = a[sortCol.value]
    let valB = b[sortCol.value]

    // Специальная логика для дат (очень наивная, но для моков сойдет)
    if (sortCol.value === 'startDate') {
      const parseDate = (d: string) => {
        const [day, month, year] = d.split('.').map(Number)
        return new Date(year, month - 1, day).getTime()
      }
      valA = parseDate(valA)
      valB = parseDate(valB)
    }

    if (valA < valB) return -1 * sortDir.value
    if (valA > valB) return 1 * sortDir.value
    return 0
  })
})

// ── МОДАЛЬНОЕ ОКНО "КОНТАКТ" ──
const isContactModalOpen = ref(false)
const editingStudent = ref<any>(null)
const contactDateTimeForm = ref('')
const contactCommentForm = ref('')

function openContactModal(student: any) {
  editingStudent.value = student
  
  // По умолчанию ставим текущие дату и время
  setNow()
  
  contactCommentForm.value = student.comment
  isContactModalOpen.value = true
}

function setNow() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  // Формат YYYY-MM-DDTHH:mm для datetime-local
  contactDateTimeForm.value = new Date(now.getTime() - offset).toISOString().slice(0, 16)
}

function closeContactModal() {
  isContactModalOpen.value = false
  editingStudent.value = null
}

function saveContact() {
  if (editingStudent.value) {
    const student = students.value.find(s => s.id === editingStudent.value.id)
    if (student) {
      // Конвертируем YYYY-MM-DDTHH:mm в DD.MM.YYYY, HH:mm
      if (contactDateTimeForm.value) {
        const [datePart, timePart] = contactDateTimeForm.value.split('T')
        const [y, m, d] = datePart.split('-')
        student.lastContact = `${d}.${m}.${y}, ${timePart}`
      } else {
        student.lastContact = ''
      }
      student.comment = contactCommentForm.value
    }
  }
  closeContactModal()
}

// ── ВЫПАДАЮЩЕЕ МЕНЮ ДЕЙСТВИЙ ──
const activeDropdownId = ref<string | null>(null)

function toggleDropdown(id: string) {
  activeDropdownId.value = activeDropdownId.value === id ? null : id
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.actions-wrap')) {
    activeDropdownId.value = null
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* ── КОСМИЧЕСКИЕ СТИЛИ (Исправленные) ── */
.content { padding: 24px 28px; }

/* Статистика */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: rgba(15, 15, 46, 0.9); border: 1px solid rgba(100,120,255,0.15); border-radius: 14px; padding: 20px; position: relative; overflow: hidden; transition: all 0.3s; }
.stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 14px 14px 0 0; }
.stat-card.blue::before { background: linear-gradient(90deg, #4f6ef7, #8b5cf6); }
.stat-card.green::before { background: linear-gradient(90deg, #10b981, #06b6d4); }
.stat-card.amber::before { background: linear-gradient(90deg, #f59e0b, #f97316); }
.stat-card.cyan::before { background: linear-gradient(90deg, #06b6d4, #4f6ef7); }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); border-color: rgba(120,140,255,0.35); }
.stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #8892b0; margin-bottom: 10px; }
.stat-value { font-size: 26px; font-weight: 700; font-family: 'Space Mono', monospace; color: #e8eeff; margin-bottom: 6px; }
.stat-sub { font-size: 11.5px; color: #8892b0; }
.stat-sub .up { color: #10b981; }
.stat-sub .warn { color: #f59e0b; }
.stat-icon { position: absolute; top: 16px; right: 16px; font-size: 22px; opacity: 0.4; }

/* Тулбар и фильтры */
.table-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.toolbar-left { display: flex; align-items: center; gap: 12px; }
.section-title { font-size: 16px; font-weight: 600; color: #e8eeff; display: flex; align-items: center; gap: 8px; }
.section-count { font-size: 11px; font-family: 'Space Mono', monospace; background: rgba(79,110,247,0.15); color: #4f6ef7; border: 1px solid rgba(79,110,247,0.3); padding: 2px 8px; border-radius: 8px; }

.filter-chips { display: flex; gap: 6px; }
.chip { display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid rgba(100,120,255,0.15); background: rgba(255,255,255,0.04); color: #8892b0; transition: all 0.15s; }
.chip:hover { border-color: rgba(120,140,255,0.35); color: #e8eeff; }
.chip-dot { width: 6px; height: 6px; border-radius: 50%; }
.chip-dot.amber { background: #f59e0b; }
.chip-dot.blue { background: #4f6ef7; }

.dropdown-filter-btn { padding: 6px 12px; border-radius: 8px; font-size: 12.5px; font-weight: 500; cursor: pointer; border: 1px solid rgba(100,120,255,0.15); background: rgba(255,255,255,0.04); color: #8892b0; transition: all 0.15s; }
.dropdown-filter-btn:hover { border-color: rgba(120,140,255,0.35); color: #e8eeff; }

/* ── ИДЕАЛЬНАЯ ТАБЛИЦА ── */
.table-container { background: rgba(15, 15, 46, 0.9); border: 1px solid rgba(100,120,255,0.15); border-radius: 14px; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; min-width: 1200px; /* <- ЭТО СПАСЕТ ОТ СЖАТИЯ */ }
th { padding: 11px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #8892b0; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(100,120,255,0.15); white-space: nowrap; user-select: none; }
td { padding: 12px 14px; font-size: 13.5px; color: #e8eeff; border-bottom: 1px solid rgba(100,120,255,0.07); vertical-align: middle; white-space: nowrap; }
.table-row:hover { background: rgba(79,110,247,0.06); cursor: pointer; }

/* Специфичные колонки */
.comment-header { width: 100%; } /* Комментарий забирает всё свободное место */
.actions-header { width: 50px; text-align: center; }

/* Внутренности ячеек */
.name-cell { display: flex; flex-direction: column; }
.student-name { font-weight: 600; color: #4f6ef7; text-decoration: none; transition: color 0.15s; }
.student-name:hover { color: #e8eeff; text-decoration: underline; }
.student-meta { font-size: 11px; color: #8892b0; margin-top: 2px; font-family: 'Space Mono', monospace; }

.date-mono { font-family: 'Space Mono', monospace; color: #e8eeff; font-size: 12.5px; }

.timer-cell { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
.timer-days { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; }
.timer-days.high-alert { color: #ef4444; }
.timer-label { font-size: 10px; color: #8892b0; text-transform: uppercase; }

.group-cell { display: flex; align-items: center; gap: 7px; }
.group-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.group-name { font-size: 12.5px; }

.enrollment-list { display: flex; flex-direction: column; gap: 6px; }
.enrollment-item { height: 20px; display: flex; align-items: center; white-space: nowrap; font-size: 13.5px; }
.school-name { color: #8892b0; font-weight: 500; font-size: 12.5px; }

.person-cell { display: flex; align-items: center; gap: 7px; }
.mini-avatar { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: white; }
.person-name { font-size: 12.5px; font-weight: 500; }

.comment-cell { max-width: 250px; overflow: hidden; text-overflow: ellipsis; font-size: 12.5px; color: #8892b0; font-style: italic; white-space: nowrap; }

.actions-wrap { display: flex; justify-content: center; position: relative; }
.actions-btn { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(100,120,255,0.15); color: #8892b0; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; font-size: 16px; border-color: transparent; }
.actions-btn:hover { background: rgba(79,110,247,0.1); border-color: rgba(120,140,255,0.35); color: #e8eeff; }

.actions-dropdown { position: absolute; top: calc(100% + 5px); right: 0; background: #0d0d2b; border: 1px solid rgba(120,140,255,0.25); border-radius: 10px; padding: 6px; min-width: 180px; z-index: 300; display: none; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
.actions-dropdown.open { display: block; }

.action-item { padding: 8px 12px; font-size: 12.5px; border-radius: 6px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 8px; color: #8892b0; }
.action-item:hover { background: rgba(79,110,247,0.12); color: #e8eeff; }
.action-item.danger { color: #ef4444; }
.action-item.danger:hover { background: rgba(239,68,68,0.1); }

/* ── НОВЫЕ СТИЛИ ДЛЯ КОНТАКТА И МОДАЛКИ ── */
.last-contact-cell { display: flex; align-items: center; gap: 6px; }
.contact-edit-btn { width: 22px; height: 22px; border-radius: 5px; background: rgba(79,110,247,0.1); border: 1px solid rgba(79,110,247,0.2); color: #4f6ef7; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; font-size: 11px; }
.contact-edit-btn:hover { background: rgba(79,110,247,0.25); box-shadow: 0 0 8px rgba(79,110,247,0.3); }

.modal-backdrop { position: fixed; inset: 0; background: rgba(4,4,15,0.82); backdrop-filter: blur(8px); z-index: 500; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.25s; }
.modal-backdrop.active { opacity: 1; pointer-events: all; }
.modal { background: #0d0d2b; border: 1px solid rgba(120,140,255,0.35); border-radius: 16px; padding: 28px; width: 500px; }

.popup-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; color: #e8eeff; }
.popup-sub { font-size: 13px; color: #8892b0; margin-bottom: 24px; }
.popup-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #8892b0; margin-bottom: 8px; display: block; }

.popup-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.quick-date-btn { background: rgba(79,110,247,0.15); border: 1px solid rgba(79,110,247,0.3); color: #4f6ef7; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer; transition: all 0.15s; text-transform: uppercase; letter-spacing: 0.05em; }
.quick-date-btn:hover { background: rgba(79,110,247,0.25); border-color: #4f6ef7; color: #fff; }

.popup-input, .modal-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(100,120,255,0.2); border-radius: 10px; padding: 12px 16px; color: #e8eeff; font-family: inherit; font-size: 14px; outline: none; transition: all 0.2s; margin-bottom: 20px; }
.popup-input:focus, .modal-input:focus { border-color: #4f6ef7; background: rgba(255,255,255,0.08); box-shadow: 0 0 12px rgba(79,110,247,0.15); }
/* Стили для иконки календаря в Chrome/Safari */
.modal-input::-webkit-calendar-picker-indicator { filter: invert(0.8) sepia(100%) saturate(1000%) hue-rotate(190deg); cursor: pointer; }

.popup-actions { display: flex; gap: 12px; margin-top: 8px; }
.popup-actions .btn { flex: 1; justify-content: center; padding: 12px; font-weight: 600; }
</style>
