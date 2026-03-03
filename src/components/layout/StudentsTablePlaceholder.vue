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
            <th>Имя Фамилия <span class="sort-icon">↕</span></th>
            <th>Дата старта <span class="sort-icon">↕</span></th>
            <th>Срок обучения <span class="sort-icon">↕</span></th>
            <th class="no-sort">Учитель</th>
            <th class="no-sort">Группа</th>
            <th>Последний контакт <span class="sort-icon">↕</span></th>
            <th class="no-sort">Кто общался</th>
            <th class="no-sort">Последний комментарий</th>
            <th class="no-sort" style="width:50px;text-align:center">···</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.id" class="student-row">
            <td>
              <div class="name-cell">
                <a href="#" class="student-name">{{ student.name }}</a>
                <div class="student-meta">{{ student.phone }}</div>
              </div>
            </td>
            <td><span class="date-mono">{{ student.startDate }}</span></td>
            <td>
              <div class="timer-cell">
                <span class="timer-days" :class="{ 'high-alert': student.daysSinceContact > 10 }">
                  {{ student.daysInSystem }}
                </span>
                <span class="timer-label">дней</span>
              </div>
            </td>
            <td>{{ student.teacher }}</td>
            <td>
              <div class="group-cell">
                <span class="group-dot" :style="{ background: student.groupColor }"></span>
                <span class="group-name">{{ student.group }}</span>
              </div>
            </td>
            <td><span class="date-mono">{{ student.lastContact }}</span></td>
            <td>
              <div class="person-cell">
                <div class="mini-avatar" :style="{ background: student.avatarColor }">{{ student.staffInitials }}</div>
                <span class="person-name">{{ student.staff }}</span>
              </div>
            </td>
            <td><div class="comment-cell">{{ student.comment }}</div></td>
            <td>
              <div class="actions-wrap">
                <button class="actions-btn">⋮</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Создаем "базу данных" прямо в компоненте. Позже бэкендер подключит сюда API.
const students = ref([
  {
    id: 1,
    name: 'Иван Иванов',
    phone: '+48 123 456 789',
    startDate: '01.09.2023',
    daysInSystem: 124,
    teacher: 'Клара Левит',
    group: 'Вт 17 Младшая',
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
    id: 2,
    name: 'Мария Смирнова',
    phone: '+48 987 654 321',
    startDate: '15.08.2023',
    daysInSystem: 140,
    teacher: 'Пиотр Ивановски',
    group: 'Ср 15 ПИе Младшая',
    groupColor: '#10b981',
    lastContact: '3 дня назад',
    daysSinceContact: 3,
    staff: 'Светлана',
    staffInitials: 'СВ',
    avatarColor: '#8b5cf6',
    comment: 'Всё отлично',
    paid: true
  },
  {
    id: 3,
    name: 'Кирилл Козлов',
    phone: '+48 111 222 333',
    startDate: '10.01.2024',
    daysInSystem: 45,
    teacher: 'Анна Новак',
    group: 'Пт 19 Старшая',
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
</script>

<style scoped>
/* ── ТВОИ КОСМИЧЕСКИЕ СТИЛИ ДЛЯ ТАБЛИЦЫ ── */
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

/* Таблица */
.table-container { background: rgba(15, 15, 46, 0.9); border: 1px solid rgba(100,120,255,0.15); border-radius: 14px; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { padding: 11px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #8892b0; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(100,120,255,0.15); }
td { padding: 12px 14px; font-size: 13.5px; color: #e8eeff; border-bottom: 1px solid rgba(100,120,255,0.07); vertical-align: middle; white-space: nowrap; }
.student-row:hover { background: rgba(79,110,247,0.06); cursor: pointer; }

/* Ячейки */
.student-name { font-weight: 600; color: #4f6ef7; text-decoration: none; transition: color 0.15s; }
.student-name:hover { color: #e8eeff; text-decoration: underline; }
.student-meta { font-size: 11px; color: #8892b0; margin-top: 1px; font-family: 'Space Mono', monospace; }
.date-mono { font-family: 'Space Mono', monospace; color: #e8eeff; }

.timer-cell { display: flex; flex-direction: column; gap: 1px; }
.timer-days { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; }
.timer-days.high-alert { color: #ef4444; }
.timer-label { font-size: 10px; color: #8892b0; text-transform: uppercase; }

.group-cell { display: flex; align-items: center; gap: 7px; }
.group-dot { width: 8px; height: 8px; border-radius: 50%; }
.group-name { font-size: 12.5px; }

.person-cell { display: flex; align-items: center; gap: 7px; }
.mini-avatar { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: white; }
.person-name { font-size: 12.5px; font-weight: 500; }

.comment-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; font-size: 12.5px; color: #8892b0; font-style: italic; }

.actions-btn { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(100,120,255,0.15); color: #8892b0; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; font-size: 16px; }
.actions-btn:hover { background: rgba(79,110,247,0.1); border-color: rgba(120,140,255,0.35); color: #e8eeff; }
</style>
