<template>
  <div class="groups-tab" v-if="currentStudent">
    <div v-for="(enr, index) in currentStudent.enrollments" :key="index" class="prog-block">
      <div class="prog-block-toggle">
        <div class="prog-icon" :class="enr.school === 'Space Memory' ? 'prog-icon-sm' : 'prog-icon-ind'">
          {{ enr.school === 'Space Memory' ? '🧠' : '⚡' }}
        </div>
        <div class="prog-title-wrap">
          <div class="prog-title">{{ enr.school }}</div>
          <div class="prog-subtitle">{{ t('groups.lessons.current') }}: {{ enr.group }} · {{ enr.teacher }}</div>
        </div>
      </div>

      <div class="prog-body open">
        <div class="cg-card">
          <div class="cg-stats">
            <div class="cg-stat"><div class="cg-stat-val">{{ enr.lessons?.length || 0 }}</div><div class="cg-stat-label">{{ t('groups.statTotal') }}</div></div>
            <div class="cg-stat"><div class="cg-stat-val" style="color:var(--green)">{{ enr.lessons?.filter(l => l.attendance === 'Присутствовал' || l.attendance === 'present').length || 0 }}</div><div class="cg-stat-label">{{ t('groups.statPresent') }}</div></div>
            <div class="cg-stat"><div class="cg-stat-val" style="color:var(--red)">{{ enr.lessons?.filter(l => l.attendance === 'Отсутствовал' || l.attendance === 'absent').length || 0 }}</div><div class="cg-stat-label">{{ t('groups.statAbsent') }}</div></div>
          </div>
        </div>

        <div style="overflow-x: auto; width: 100%; border-radius: 8px;">
          <table class="lesson-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{{ t('groups.lessons.date') }}</th>
                <th>{{ t('groups.lessons.block') }}</th>
                <th>{{ t('groups.lessons.element') }}</th>
                <th>{{ t('groups.lessons.trainer') }}</th>
                <th style="text-align:center">{{ t('groups.lessons.attendance') }}</th>
                <th>{{ t('groups.lessons.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(lesson, lIdx) in enr.lessons" :key="lesson.id">
                <td class="lesson-num">{{ enr.lessons.length - lIdx }}</td>
                <td style="font-family:'Space Mono',monospace;font-size:11px;white-space:nowrap">{{ lesson.date }}</td>
                <td>
                  <div class="topic-cell">
                    <select class="topic-select" v-model="lesson.theme">
                      <option value="">{{ t('groups.lessons.selectBlock') }}</option>
                      <option v-if="enr.school === 'Speedy Mind Indigo'">Просто друзья</option>
                      <option v-if="enr.school === 'Speedy Mind Indigo'">Маленькие друзья</option>
                      <option v-if="enr.school === 'Speedy Mind Indigo'">Большие друзья</option>
                      <option v-if="enr.school === 'Space Memory'">Ассоциации</option>
                      <option v-if="enr.school === 'Space Memory'">Дворец памяти</option>
                      <option :value="lesson.theme" style="display:none">{{ lesson.theme }}</option>
                    </select>
                  </div>
                </td>
                <td>
                  <select class="topic-select lvl2" :class="{'topic-select-ind': enr.school === 'Speedy Mind Indigo'}" v-model="lesson.element">
                    <option value="">{{ t('groups.lessons.selectElement') }}</option>
                    <option v-if="enr.school === 'Speedy Mind Indigo'">1</option>
                    <option v-if="enr.school === 'Speedy Mind Indigo'">10</option>
                    <option v-if="enr.school === 'Space Memory'">Слова</option>
                    <option v-if="enr.school === 'Space Memory'">Локации</option>
                    <option :value="lesson.element" style="display:none">{{ lesson.element }}</option>
                  </select>
                </td>
                <td><div class="trainer-main">{{ lesson.teacher }}</div></td>
                <td style="text-align:center">
                  <span class="att-dot" @click="openAttendanceModal(enr, lesson, enr.lessons.length - lIdx)" :class="{
                    'att-ok': lesson.attendance === 'Присутствовал' || lesson.attendance === 'present',
                    'att-no': lesson.attendance === 'Отсутствовал' || lesson.attendance === 'absent',
                    'att-future': lesson.attendance === 'Будет' || lesson.attendance === 'future'
                  }">{{ (lesson.attendance === 'Присутствовал' || lesson.attendance === 'present') ? '✓' : (lesson.attendance === 'Отсутствовал' || lesson.attendance === 'absent') ? '✕' : '–' }}</span>
                </td>
                <td>
                  <span class="sc" :class="{
                    'sc-green': lesson.status === 'Оплачено',
                    'sc-blue': lesson.status === 'Ожидает',
                    'sc-makeup': lesson.status === 'Отработка'
                  }">{{ formatStatus(lesson.status) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="history-wrap">
          <div class="history-label">{{ t('groups.lessons.history') }}</div>
          <div class="history-flow">
            <div class="hi hi-current" :class="{'hi-current-ind': enr.school === 'Speedy Mind Indigo'}">
              <div class="hi-body">
                <div class="hi-name">{{ enr.group }}</div>
                <div class="hi-dates">{{ t('attendance.trainer') }}: {{ enr.teacher }}</div>
                <div class="hi-now">● {{ t('groups.lessons.current') }}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useStudentTabsStore } from "../../../../stores/studentTabs.store";
import { useModalStore } from "../../../../stores/modal.store";
import { storeToRefs } from "pinia";

const { t } = useI18n();
const studentTabsStore = useStudentTabsStore();
const { student: currentStudent } = storeToRefs(studentTabsStore);

// modalStore initialization in case it's needed for future actions
const modalStore = useModalStore();

/**
 * Maps hardcoded statuses to localized strings
 */
function formatStatus(status: string) {
  if (status === 'Оплачено') return t('payments.status.paid');
  if (status === 'Ожидает') return t('payments.status.pending');
  if (status === 'Отработка') return t('groups.lessons.statusMakeup');
  return status;
}

const openAttendanceModal = (enrollment: any, lesson: any, lessonNum: number) => {
  modalStore.openModal('attendance', {
    enrollmentId: enrollment.school, // Используем для поиска школы при сохранении
    studentId: currentStudent.value?.id,
    schoolName: enrollment.school,
    lessonId: lesson.id,
    lessonNum: lessonNum, // Передаем реальное число
    date: lesson.date,
    currentAttendance: lesson.attendance,
    // История изменений (фейковая для прототипа)
    history: [
      { author: enrollment.teacher, date: lesson.date, action: `Отмечено: ${lesson.attendance}` }
    ]
  });
};
</script>

<style scoped>
.groups-tab { padding: 10px 0; }
.prog-block { border:1px solid var(--border-color, rgba(100,120,255,0.15)); border-radius:14px; overflow:hidden; margin-bottom:20px; background: rgba(255,255,255,0.01); }
.prog-block-toggle { display:flex; align-items:center; gap:11px; padding:12px 16px; background:rgba(255,255,255,0.03); border-bottom:1px solid rgba(100,120,255,0.15); }
.prog-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; }
.prog-icon-sm { background:linear-gradient(135deg,#4f6ef7,#8b5cf6); box-shadow:0 0 10px rgba(79,110,247,.3); }
.prog-icon-ind { background:linear-gradient(135deg,#06b6d4,#8b5cf6); box-shadow:0 0 10px rgba(6,182,212,.25); }
.prog-title { font-size:13px; font-weight:700; color:#e8eeff; }
.prog-subtitle { font-size:11px; color:#8892b0; margin-top:2px; }
.prog-body { padding: 0 10px 15px 10px; }
.cg-card { padding:14px 16px 12px; }
.cg-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; }
.cg-stat { text-align:center; padding:8px 4px; background:rgba(255,255,255,.03); border:1px solid rgba(100,120,255,0.15); border-radius:8px; }
.cg-stat-val { font-family:'Space Mono',monospace; font-size:15px; font-weight:700; color:#4f6ef7; }
.cg-stat-label { font-size:10px; color:#8892b0; margin-top:2px; }

.lesson-table { width:100%; border-collapse:collapse; }
.lesson-table tr {
  display: grid;
  grid-template-columns: 30px 75px 160px 100px 120px 50px 100px;
  gap: 12px;
  width: 100%;
  justify-content: start;
  align-items: center;
}
.lesson-table th { font-size: 9px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#8892b0; padding:6px 4px; text-align:left; border-bottom:1px solid rgba(100,120,255,0.15); background:rgba(255,255,255,.012); }
.lesson-table td { 
  padding:6px 4px; 
  font-size: 11px; 
  border-bottom:1px solid rgba(100,120,255,.06); 
  vertical-align:middle; 
  color:#e8eeff; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lesson-table tr:hover td { background:rgba(79,110,247,.04); }
.lesson-num { font-family:'Space Mono',monospace; font-size:11px; color:#8892b0; }

.topic-select { 
  background:rgba(255,255,255,.04); 
  border:1px solid rgba(100,120,255,0.15); 
  border-radius:7px; 
  padding: 3px 5px; 
  color:#e8eeff; 
  font-family:'Outfit',sans-serif; 
  font-size: 10.5px; 
  outline:none; 
  width:100%; 
  max-width: 100%;
  min-width: 0; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
  overflow: hidden; 
}
.topic-select.lvl2 { background:rgba(139,92,246,.06); border-color:rgba(139,92,246,.2); color:#8b5cf6; font-size:11px; }
.topic-select-ind.lvl2 { background:rgba(6,182,212,.06); border-color:rgba(6,182,212,.2); color:#06b6d4; }

.trainer-main { 
  font-size:12px; 
  color:#8892b0; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}
.att-dot { 
  width:26px; 
  height:26px; 
  border-radius:7px; 
  display:inline-flex; 
  align-items:center; 
  justify-content:center; 
  font-size:13px; 
  border:1px solid transparent; 
  cursor:pointer; 
}
.att-ok { background:rgba(16,185,129,.12); border-color:rgba(16,185,129,.28); color:#10b981; }
.att-no { background:rgba(239,68,68,.1); border-color:rgba(239,68,68,.25); color:#ef4444; }
.att-future { background:rgba(255,255,255,.03); border-color:rgba(100,120,255,0.15); color:#8892b0; }

.sc { display:inline-flex; align-items:center; padding:2px 7px; border-radius:5px; font-size:10.5px; font-weight:600; white-space:nowrap; }
.sc-green { background:rgba(16,185,129,.12); color:#10b981; border:1px solid rgba(16,185,129,.25); }
.sc-blue { background:rgba(79,110,247,.12); color:#4f6ef7; border:1px solid rgba(79,110,247,.25); }
.sc-makeup { background:rgba(6,182,212,.1); color:#06b6d4; border:1px solid rgba(6,182,212,.25); }

.history-wrap { padding:14px 16px; background:rgba(255,255,255,.01); border-top:1px solid rgba(100,120,255,0.15); }
.history-label { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#8892b0; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
.history-label::after { content:''; flex:1; height:1px; background:rgba(100,120,255,0.15); }
.history-flow { display:flex; flex-direction:column-reverse; position:relative; padding-left:28px; }
.history-flow::before { content:''; position:absolute; left:10px; top:12px; bottom:12px; width:2px; background:linear-gradient(to top,rgba(100,120,255,0.15),rgba(79,110,247,.35)); border-radius:1px; }
.hi { display:flex; align-items:flex-start; gap:10px; padding:6px 0; position:relative; }
.hi::before { content:''; width:10px; height:10px; border-radius:50%; position:absolute; left:-23px; top:8px; border:2px solid rgba(100,120,255,0.15); background:#04040f; }
.hi.hi-current::before { border-color:#4f6ef7; background:#4f6ef7; box-shadow:0 0 6px rgba(79,110,247,.5); }
.hi.hi-current-ind::before { border-color:#06b6d4; background:#06b6d4; box-shadow:0 0 6px rgba(6,182,212,.5); }
.hi-name { font-size:12.5px; font-weight:700; color:#e8eeff; }
.hi-dates { font-size:11px; color:#8892b0; margin-top:1px; }
.hi-now { display:inline-flex; align-items:center; gap:4px; margin-top:3px; font-size:10.5px; font-weight:700; color:#10b981; background:rgba(16,185,129,.1); border:1px solid rgba(16,185,129,.25); padding:2px 8px; border-radius:5px; }
</style>