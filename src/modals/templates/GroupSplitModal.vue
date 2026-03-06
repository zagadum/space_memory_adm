<template>
  <BaseModal popupClass="popup-group-split">
    <div class="popup-title">{{ t("modals.groupSplit.title") }}</div>
    <div class="popup-sub">
      {{ t('modals.groupSplit.month') }}: <strong style="color:var(--white)">{{ monthTitle }}</strong> · {{ t('modals.groupSplit.totalLessons') }} <strong style="color:var(--blue)">{{ maxLessons }}</strong> {{ t('modals.groupSplit.lessonsWord') }}
    </div>

    <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
      
      <div 
        v-for="(row, i) in rows" 
        :key="row.id" 
        class="split-row" 
        :style="{ background: getRowColor(i).bg, border: `1px solid ${getRowColor(i).border}` }"
      >
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px;">
          <div :style="{ background: getRowColor(i).accent }" style="width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; color:#000; flex-shrink:0">
            {{ i + 1 }}
          </div>
            <select class="popup-input" style="flex:1; margin-bottom:0; font-size:11.5px" v-model="row.teacherId" @change="onTeacherChange(row)">
            <option v-for="t in TEACHERS_DB" :key="t.id" :value="t.id">
              {{ t.group }} · {{ t.schedule }} · {{ t.name }}
            </option>
          </select>
          <button v-if="i > 0" @click="removeRow(i)" style="background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.25); color:var(--red); border-radius:6px; padding:4px 9px; cursor:pointer; font-size:13px; flex-shrink:0; line-height:1">
            ✕
          </button>
          <div v-else style="width:32px"></div>
        </div>

        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <span style="font-size:11px; color:var(--dim); flex-shrink:0">{{ t('modals.groupSplit.lessonsCount') }}:</span>
          <button @click="changeLessons(row, -1)" style="width:26px; height:26px; border-radius:6px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); color:var(--white); font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; line-height:1">−</button>
          <span :style="{ color: getRowColor(i).accent }" style="font-family:'Space Mono',monospace; font-size:20px; font-weight:800; min-width:22px; text-align:center">
            {{ row.lessons }}
          </span>
          <button @click="changeLessons(row, 1)" style="width:26px; height:26px; border-radius:6px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); color:var(--white); font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; line-height:1">+</button>
          <div style="flex:1; height:5px; background:rgba(255,255,255,.07); border-radius:3px; overflow:hidden">
            <div :style="{ width: (row.lessons / maxLessons * 100) + '%', background: getRowColor(i).accent }" style="height:100%; border-radius:3px; transition:width .2s"></div>
          </div>
        </div>

        <div style="margin-bottom:8px;">
          <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--dim); margin-bottom:5px">{{ t('modals.groupSplit.specificDates') }}</div>
          <div v-for="(lessonNum, li) in row.lessons" :key="li" style="display:flex; align-items:center; gap:5px; margin-bottom:4px;">
            <span style="font-size:10px; color:var(--dim); min-width:44px; flex-shrink:0">{{ t('modals.groupSplit.lessonN') }} {{ li + 1 }}:</span>
            
            <select class="popup-input" style="margin-bottom:0; font-size:11px; flex:1; padding:4px 8px" v-model="row.dates[li]">
              <option v-if="getAvailableDates(row.teacherId).length === 0" value="">{{ t('modals.groupSplit.noDates') }}</option>
              <option v-for="d in getAvailableDates(row.teacherId)" :key="d.date" :value="d.date">
                {{ d.dowStr }} {{ d.date }} · {{ getTeacherObj(row.teacherId).schedule }}
              </option>
              <option value="custom">✏️ {{ t('modals.groupSplit.enterManually') }}</option>
            </select>

            <input 
              v-if="row.dates[li] === 'custom' || (row.dates[li] && !getAvailableDates(row.teacherId).some(d => d.date === row.dates[li]))" 
              class="popup-input" 
              style="margin-bottom:0; font-size:11px; width:110px; flex-shrink:0"
              :placeholder="t('modals.placeholders.ddmmyyyy')" 
              v-model="row.manualDates[li]"
              @input="onManualDateInput(row, li)"
            >
          </div>
        </div>

        <div>
          <label :style="{ color: !row.reason ? 'var(--red)' : 'var(--dim)' }" style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; display:block; margin-bottom:4px">
            {{ t('modals.groupSplit.changeReason') }} <span style="color:var(--red)">★</span>
          </label>
          <select class="popup-input" :style="{ marginBottom: row.reason === 'other' ? '4px' : '0', borderColor: !row.reason ? 'rgba(239,68,68,.5)' : '' }" v-model="row.reason">
            <option value="">{{ t('modals.groupSplit.selectReason') }}</option>
            <option value="teacher_absent">{{ t('modals.groupSplit.reasons.teacherAbsent') }}</option>
            <option value="group_change">{{ t('modals.groupSplit.reasons.groupChange') }}</option>
            <option value="schedule_conflict">{{ t('modals.groupSplit.reasons.scheduleConflict') }}</option>
            <option value="trial">{{ t('modals.groupSplit.reasons.trial') }}</option>
            <option value="makeup">{{ t('modals.groupSplit.reasons.makeup') }}</option>
            <option value="other">{{ t('modals.groupSplit.reasons.other') }}</option>
          </select>
          <input v-if="row.reason === 'other'" class="popup-input" style="margin-bottom:0; font-size:11px" :placeholder="t('modals.groupSplit.describeReason')" v-model="row.reasonText">
        </div>
      </div>
    </div>

    <button 
      v-if="usedLessons < maxLessons && rows.length < maxLessons" 
      @click="addRow" 
      class="btn btn-ghost btn-sm" 
      style="width:100%; justify-content:center; margin-bottom:12px; border-style:dashed"
    >
      + {{ t('modals.groupSplit.addGroup') }}
    </button>

    <div style="background:rgba(255,255,255,.03); border:1px solid rgba(100,120,255,.13); border-radius:9px; padding:10px 12px; margin-bottom:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
        <div style="display:flex; align-items:center; gap:7px;">
          <span style="font-size:12px; color:var(--dim)">{{ t('modals.groupSplit.totalCount') }}:</span>
          <span style="font-family:'Space Mono',monospace; font-size:18px; font-weight:800;" :style="{ color: isComplete ? 'var(--green)' : isOver ? 'var(--red)' : 'var(--amber)' }">
            {{ usedLessons }}
          </span>
          <span style="font-size:12px; color:var(--dim)">/ {{ maxLessons }}</span>
        </div>
        <span style="font-size:11px; font-weight:700;" :style="{ color: isComplete ? 'var(--green)' : isOver ? 'var(--red)' : 'var(--amber)' }">
          {{ isComplete ? '✓ ' + t('modals.groupSplit.ready') : isOver ? '⚠ ' + t('modals.groupSplit.exceeded') : (maxLessons - usedLessons) + ' ' + t('modals.groupSplit.remaining') }}
        </span>
      </div>
      <div style="height:6px; background:rgba(255,255,255,.06); border-radius:3px; overflow:hidden">
        <div style="height:100%; transition:width .3s;" :style="{ width: Math.min((usedLessons / maxLessons) * 100, 100) + '%', background: isComplete ? 'var(--green)' : isOver ? 'var(--red)' : 'var(--amber)' }"></div>
      </div>
    </div>

    <div class="info-box info-blue" style="margin-bottom:12px">
      <span>ℹ️</span>
      <div>{{ t('modals.groupSplit.infoText1') }} <strong style="color:var(--white)">{{ t('modals.groupSplit.infoTextBold') }}</strong> {{ t('modals.groupSplit.infoText2') }}</div>
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close" :disabled="saving">{{ t("common.cancel") }}</button>
      <div v-if="errorMessage" class="info-box info-red" style="margin-bottom:8px;font-size:11px"><span>⚠️</span><div>{{ errorMessage }}</div></div>
      <button class="btn btn-primary" @click="save" :disabled="!isValid || saving" :style="{ opacity: isValid ? '1' : '0.4' }">
        {{ saving ? t('common.saving') : '✓ ' + t('modals.groupSplit.saveSplit') }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import BaseModal from "../BaseModal.vue"; // ИСПРАВЛЕННЫЙ ПУТЬ
import { usePaymentsStore } from "../../stores/payments.store";
import { useModalStore } from "../../stores/modal.store";
import { paymentsApi } from "../../api/paymentsApi";
import { TEACHERS_DB } from "../../api/mockDb";

const { t } = useI18n();
const paymentsStore = usePaymentsStore();
const modal = useModalStore();

// БЕЗОПАСНЫЙ ПАРСИНГ ДАННЫХ ИЗ PAYLOAD
const programId = modal.payload?.programId as string | undefined;
const year = modal.payload?.year ? Number(modal.payload.year) : new Date().getFullYear();
const monthIndex = modal.payload?.monthIndex !== undefined ? Number(modal.payload.monthIndex) : new Date().getMonth();
const maxLessons = ref(4);

const MONTHS_F = computed(() => {
  const arr = t('payments.monthsFull');
  return Array.isArray(arr) ? arr : ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
});
const DOW_RU = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
const monthTitle = computed(() => `${MONTHS_F.value[monthIndex]} ${year}`);

const ROW_COLORS = [
  { bg: 'rgba(79,110,247,.08)',  border: 'rgba(79,110,247,.35)',  accent: 'var(--blue)' },
  { bg: 'rgba(6,182,212,.08)',   border: 'rgba(6,182,212,.35)',   accent: 'var(--cyan)' },
  { bg: 'rgba(139,92,246,.08)',  border: 'rgba(139,92,246,.35)',  accent: 'var(--purple)' },
  { bg: 'rgba(245,158,11,.08)',  border: 'rgba(245,158,11,.35)',  accent: 'var(--amber)' },
  { bg: 'rgba(16,185,129,.08)',  border: 'rgba(16,185,129,.35)',  accent: 'var(--green)' },
];

interface SplitRow {
  id: number;
  teacherId: string;
  lessons: number;
  dates: string[];
  manualDates: string[];
  reason: string;
  reasonText: string;
}

const rows = ref<SplitRow[]>([]);
let rowIdCounter = 0;
const saving = ref(false);
const errorMessage = ref('');

function fmtDate(d: Date) {
  return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
}

// ИСПРАВЛЕННЫЙ ЦИКЛ: Создаем новый объект Date на каждой итерации
function getDatesForDow(yr: number, mo: number, dow: number) {
  const dates = [];
  let d = new Date(yr, mo, 1);
  while (d.getMonth() === mo) {
    if (d.getDay() === dow) dates.push(new Date(d)); // <-- ТУТ БЫЛА ОШИБКА
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function getAvailableDates(teacherId: string) {
  const t = getTeacherObj(teacherId);
  const rawDates = getDatesForDow(year, monthIndex, t.dow);
  return rawDates.map(d => ({ date: fmtDate(d), dowStr: DOW_RU[d.getDay()] }));
}

function getTeacherObj(teacherId: string) {
  return TEACHERS_DB.find(t => t.id === teacherId) || TEACHERS_DB[0];
}

function getRowColor(index: number) {
  return ROW_COLORS[index % ROW_COLORS.length];
}

function addRow() {
  if (usedLessons.value >= maxLessons.value) return;
  const t = TEACHERS_DB[0];
  const dates = getAvailableDates(t.id).slice(0, 1).map(d => d.date);
  rows.value.push({
    id: rowIdCounter++, teacherId: t.id, lessons: 1, 
    dates: [...dates], manualDates: [...dates], reason: '', reasonText: ''
  });
}

function removeRow(index: number) {
  rows.value.splice(index, 1);
}

function changeLessons(row: SplitRow, delta: number) {
  const newVal = row.lessons + delta;
  if (newVal < 1) return;
  if (delta > 0 && usedLessons.value >= maxLessons.value) return;
  
  row.lessons = newVal;
  const avail = getAvailableDates(row.teacherId).map(d => d.date);
  while (row.dates.length < newVal) {
    row.dates.push(avail[row.dates.length] || '');
    row.manualDates.push('');
  }
}

function onTeacherChange(row: SplitRow) {
  const avail = getAvailableDates(row.teacherId).map(d => d.date);
  row.dates = avail.slice(0, row.lessons);
  row.manualDates = [...row.dates];
}

function onManualDateInput(row: SplitRow, index: number) {
  row.dates[index] = row.manualDates[index];
}

const usedLessons = computed(() => rows.value.reduce((sum, r) => sum + r.lessons, 0));
const isComplete = computed(() => usedLessons.value === maxLessons.value);
const isOver = computed(() => usedLessons.value > maxLessons.value);

const isValid = computed(() => {
  if (!isComplete.value) return false;
  return rows.value.every(r => {
    if (!r.reason) return false;
    if (r.reason === 'other' && (!r.reasonText || !r.reasonText.trim())) return false;
    return true;
  });
});

function close() { modal.close(); }

async function save() {
  saving.value = true;
  errorMessage.value = '';
  try {
    // Simulated API call — replace with real API in production
    await new Promise(r => setTimeout(r, 600));
    // Reload store data after successful mutation
    await paymentsStore.loadStudent();
    modal.close();
  } catch (e: unknown) {
    errorMessage.value = e instanceof Error ? e.message : 'Operation failed. Please try again.';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  // Dynamic maxLessons: count occurrences of the teacher's day-of-week in the month
  const firstTeacher = TEACHERS_DB[0];
  const datesInMonth = getDatesForDow(year, monthIndex, firstTeacher.dow);
  maxLessons.value = datesInMonth.length; // 4 or 5

  if (rows.value.length === 0) {
    const t = TEACHERS_DB[0];
    const dates = getAvailableDates(t.id).slice(0, maxLessons.value).map(d => d.date);
    rows.value.push({
      id: rowIdCounter++,
      teacherId: t.id,
      lessons: maxLessons.value,
      dates: [...dates],
      manualDates: [...dates],
      reason: '',
      reasonText: ''
    });
  }
});
</script>

<style scoped>
.popup-group-split { max-width: 500px; }
.popup-title { font-size: 15px; font-weight: 800; margin-bottom: 4px; }
.popup-sub { font-size: 11.5px; color: var(--dim); margin-bottom: 14px; line-height: 1.5; }

.split-row { background: rgba(255,255,255,.025); border-radius: 10px; padding: 10px 12px; transition: border-color .15s; }

.popup-input { background: rgba(255,255,255,.04); border: 1px solid var(--b); border-radius: 8px; padding: 8px 12px; color: var(--white); font-family: 'Outfit', sans-serif; font-size: 13px; outline: none; transition: border-color .2s; width: 100%; display: block; margin-bottom: 12px; }
.popup-input:focus { border-color: var(--blue); }

.info-box { border-radius: 8px; padding: 9px 12px; font-size: 11.5px; display: flex; align-items: flex-start; gap: 8px; line-height: 1.5; }
.info-blue { background: rgba(79,110,247,.07); border: 1px solid rgba(79,110,247,.2); color: var(--dim); }

.popup-actions { display: flex; gap: 8px; margin-top: 4px; }
.btn { flex: 1; display: inline-flex; justify-content: center; align-items: center; gap: 5px; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600; font-family: 'Outfit', sans-serif; cursor: pointer; border: none; transition: all .15s; }
.btn-ghost { background: rgba(255,255,255,.05); color: var(--dim); border: 1px solid var(--b); }
.btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,.08); color: var(--white); border-color: rgba(120,140,255,.30); }
.btn-primary { background: linear-gradient(135deg, var(--blue), var(--purple)); color: #fff; box-shadow: 0 0 12px rgba(79,110,247,.3); }
.btn-primary:hover:not(:disabled) { box-shadow: 0 0 20px rgba(79,110,247,.5); transform: translateY(-1px); }
.btn-sm { padding: 6px 11px; font-size: 11px; }
.btn:disabled { opacity: 0.5 !important; cursor: not-allowed; transform: none !important; }
</style>