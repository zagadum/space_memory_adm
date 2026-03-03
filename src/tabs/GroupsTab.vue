<template>
  <div>
    <div class="sec-title">{{ t('groups.title') }}</div>

    <div v-if="loading.groups" class="sk-wrap">
      <div class="sk" v-for="i in 2" :key="i"></div>
    </div>

    <div v-else>
      <div class="prog-block" v-for="p in groups" :key="p.id">
        <div class="prog-block-toggle" @click="toggle(p.id)">
          <div class="prog-icon" :class="p.programId === 'space' ? 'prog-icon-sm' : 'prog-icon-ind'">
            {{ p.programId === 'space' ? '🧠' : '⚡' }}
          </div>
          <div class="prog-title-wrap">
            <div class="prog-title">{{ p.programTitle || 'Space Memory' }}</div>
            <div class="prog-subtitle">{{ p.subtitle || 'Занятие #24 личных · Группа A · Пн 16:00' }}</div>
          </div>
          <span class="chip chip-green" style="font-size:10px;padding:2px 8px">● {{ t('common.active') }}</span>
          <span class="prog-chevron">
            <i class="prog-chevron-icon" :style="{ transform: openIds.has(p.id) ? 'rotate(0deg)' : 'rotate(180deg)' }">▼</i> 
            {{ openIds.has(p.id) ? t('common.collapse') : t('common.expand') }}
          </span>
        </div>

        <div class="prog-body" :class="{ open: openIds.has(p.id) }">
          
          <div class="cg-card">
            <div class="cg-head">
              <div class="cg-badge" :class="p.programId === 'indigo' ? 'cg-badge-ind' : ''">A</div>
              <div style="flex:1">
                <div class="cg-name-row">
                  <div class="cg-name">{{ t('groups.group') }} A</div>
                  <button class="btn btn-ghost btn-sm" @click.stop="openChangeGroup(p)">🔄 {{ t('groups.changeGroup') }}</button>
                </div>
                <div class="cg-meta">
                  <span>📅 Пн 16:00–17:00</span>
                  <span>👩‍🏫 Анна Ковальска</span>
                  <span>📍 Маршалковска 10, зал 2</span>
                  <span class="cg-cap">8 / 12 мест</span>
                </div>
              </div>
            </div>

            <div class="cg-stats">
              <div class="cg-stat"><div class="cg-stat-val">24</div><div class="cg-stat-label">{{ t('groups.statTotal') }}</div></div>
              <div class="cg-stat"><div class="cg-stat-val" style="color:var(--green)">21</div><div class="cg-stat-label">{{ t('groups.statPresent') }}</div></div>
              <div class="cg-stat"><div class="cg-stat-val" style="color:var(--red)">2</div><div class="cg-stat-label">{{ t('groups.statAbsent') }}</div></div>
              <div class="cg-stat"><div class="cg-stat-val" style="color:var(--purple)">87%</div><div class="cg-stat-label">{{ t('groups.statRate') }}</div></div>
            </div>
          </div>

          <div class="table-wrapper">
            <table class="lesson-table">
              <thead>
                <tr>
                  <th style="width:30px">#</th>
                  <th style="width:82px">{{ t('groups.lessons.date') }}</th>
                  <th style="width:200px">{{ t('groups.lessons.block') }}</th>
                  <th style="width:160px">{{ t('groups.lessons.element') }}</th>
                  <th style="width:150px">{{ t('groups.lessons.trainer') }}</th>
                  <th style="text-align:center;width:80px">{{ t('groups.lessons.attendance') }}</th>
                  <th>{{ t('groups.lessons.status') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="lesson in dummyLessons" :key="lesson.id">
                  <td class="lesson-num">{{ lesson.id }}</td>
                  <td class="lesson-date">{{ lesson.date }}</td>
                  <td>
                    <div class="topic-cell">
                      <select class="topic-select" v-model="lesson.block" @change="lesson.element = ''">
                        <option value="">{{ t('groups.lessons.selectBlock') }}</option>
                        <option v-for="(elements, blockName) in smDataMap" :key="blockName" :value="blockName">
                          {{ getBlockLabel(blockName) }}
                        </option>
                      </select>
                      <span 
                        class="topic-hist-icon" 
                        :class="{ 'topic-hist-has-log': lesson.hasTopicHistory }"
                        v-show="lesson.block"
                        @click="openTopicModal(lesson)">
                        📋
                      </span>
                    </div>
                  </td>
                  <td>
                    <select class="topic-select lvl2" v-model="lesson.element" :disabled="!lesson.block">
                      <option value="">{{ t('groups.lessons.selectElement') }}</option>
                      <option v-for="el in smDataMap[lesson.block]" :key="el" :value="el">{{ el }}</option>
                    </select>
                  </td>
                  <td>
                    <div class="trainer-main">{{ lesson.trainer }}</div>
                    <div v-if="lesson.subTrainer" class="trainer-sub">{{ lesson.subTrainer }}</div>
                  </td>
                  <td style="text-align:center">
                    <span class="att-dot" :class="getAttClass(lesson.att)" @click="openAttModal(lesson)">
                      {{ getAttIcon(lesson.att) }}
                    </span>
                  </td>
                  <td>
                    <span class="sc" :class="getStatusClass(lesson.status)">
                      {{ getStatusLabel(lesson) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="history-wrap">
            <div class="history-label">{{ t('groups.lessons.history') }}</div>
            <div class="history-flow">
              
              <div class="hi hi-current">
                <div class="hi-body">
                  <div class="hi-name">{{ t('groups.group') }} A · Пн 16:00</div>
                  <div class="hi-dates">с 10.02.2026 · Анна Ковальска</div>
                  <div class="hi-now">● {{ t('groups.lessons.current') }}</div>
                </div>
              </div>

              <div class="hi-arrow">
                <div class="hi-arrow-icon">↑</div>
                <div class="hi-arrow-text">Конфликт расписания со школой → смена дня</div>
              </div>

              <div class="hi-group-block" :class="{ open: isGroupBOpen }">
                <div class="hi hi-expand-toggle" @click="isGroupBOpen = !isGroupBOpen">
                  <div class="hi-body">
                    <div class="hi-name">{{ t('groups.group') }} B · Ср 17:00 <span class="hi-expand-chevron">▶</span></div>
                    <div class="hi-dates">01.09.2025 – 10.02.2026 · Марек Войчик · 20 занятий</div>
                  </div>
                </div>
              </div>

              <div class="hi-arrow">
                <div class="hi-arrow-icon">↑</div>
                <div class="hi-arrow-text">Повышение уровня → перевод в основную группу</div>
              </div>

              <div class="hi-group-block" :class="{ open: isGroupStartOpen }">
                <div class="hi hi-expand-toggle" @click="isGroupStartOpen = !isGroupStartOpen">
                  <div class="hi-body">
                    <div class="hi-name">{{ t('groups.group') }} Start · Пн 16:00 <span class="hi-expand-chevron">▶</span></div>
                    <div class="hi-dates">05.01.2025 – 01.09.2025 · Анна Ковальска · 32 занятия</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="att-popup-bd" :class="{ active: showAttModal }" @click.self="showAttModal = false">
      <div class="att-popup">
        <div class="att-popup-title">Явка · Занятие #{{ activeLesson?.id }}</div>
        <div class="att-popup-sub">{{ activeLesson?.date }} · Space Memory</div>
        
        <div class="att-toggle-row">
          <div class="att-choice" :class="{ 'selected-ok': activeLesson?.att === 'ok' }" @click="setAtt('ok')">
            <div class="att-choice-icon">✅</div>
            <div class="att-choice-label" style="color:var(--green)">Присутствовал</div>
          </div>
          <div class="att-choice" :class="{ 'selected-no': activeLesson?.att === 'no' }" @click="setAtt('no')">
            <div class="att-choice-icon">❌</div>
            <div class="att-choice-label" style="color:var(--red)">Отсутствовал</div>
          </div>
        </div>

        <button class="att-popup-save" @click="showAttModal = false">💾 Сохранить</button>
      </div>
    </div>

    <div class="topic-popup-bd" :class="{ active: showTopicModal }" @click.self="showTopicModal = false">
      <div class="topic-popup">
        <div class="topic-popup-title">История темы · Занятие #{{ activeLesson?.id }}</div>
        <div class="topic-popup-sub">{{ activeLesson?.date }} · Space Memory</div>
        
        <div v-if="!activeLesson?.hasTopicHistory" style="text-align:center;color:var(--dim);font-size:12px;padding:14px">
          Нет истории изменений
        </div>
        <div v-else>
           <div class="topic-log-row">
            <div class="topic-log-num">1</div>
            <div class="topic-log-body">
              <div class="topic-log-who">Зофия К. (замена)</div>
              <div class="topic-log-when">10.02 17:02</div>
              <div class="topic-log-change">
                <span class="topic-log-from">Метод цепочки</span>
                <span class="topic-log-arrow">→</span>
                <span class="topic-log-to">Дворец памяти</span>
              </div>
            </div>
          </div>
        </div>
        <button class="topic-popup-close" @click="showTopicModal = false">Закрыть</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useStudentTabsStore } from "../stores/studentTabs.store";
import { useModalStore } from "../stores/modal.store";

const studentId = "s_1";
const { t } = useI18n(); 
const st = useStudentTabsStore();
const modal = useModalStore();
const { groups, loading } = storeToRefs(st);

const openIds = ref(new Set<string>());
const isGroupBOpen = ref(false);
const isGroupStartOpen = ref(false);

function toggle(id: string) {
  const next = new Set(openIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  openIds.value = next;
}

function openChangeGroup(p: any) {
  modal.open("change-group", { group: p });
}

// Данные выпадающих списков
const smDataMap: Record<string, string[]> = {
  palace:  ['Маршрут 1','Маршрут 2','Маршрут 3','Маршрут 4','Маршрут 5','Повторение'],
  nbcode:  ['00–10','00–20','00–30','00–40','00–50','00–60','00–70','00–80','00–90','00–100'],
  chain:   ['5 образов','10 образов','15 образов','20 образов','Повторение'],
};

function getBlockLabel(key: string) {
  const labels: Record<string, string> = {
    palace: 'Дворец памяти', nbcode: 'Число-буквенный код', chain: 'Метод цепочки'
  };
  return labels[key] || key;
}

// Данные уроков
const dummyLessons = ref([
  { id: 25, date: '02.03.2026', block: '', element: '', trainer: 'Анна К.', subTrainer: '', att: 'future', status: 'pending', hasTopicHistory: false },
  { id: 24, date: '24.02.2026', block: 'nbcode', element: '00–70', trainer: 'Анна К.', subTrainer: '', att: 'ok', status: 'pending', hasTopicHistory: false },
  { id: 23, date: '17.02.2026', block: 'nbcode', element: '00–60', trainer: 'Анна К.', subTrainer: '', att: 'ok', status: 'done', hasTopicHistory: true },
  { id: 22, date: '10.02.2026', block: 'palace', element: 'Маршрут 3', trainer: 'Зофия К.', subTrainer: '⚡ Замена (Анна К.)', att: 'ok', status: 'done', hasTopicHistory: true },
  { id: 21, date: '03.02.2026', block: 'chain', element: '10 образов', trainer: 'Анна К.', subTrainer: '', att: 'no', status: 'makeup', makeupDate: '15.02', hasTopicHistory: false }
]);

// Логика статусов
function getAttClass(att: string) { return att === 'ok' ? 'att-ok' : att === 'no' ? 'att-no' : 'att-future'; }
function getAttIcon(att: string) { return att === 'ok' ? '✓' : att === 'no' ? '✕' : '–'; }

function getStatusClass(status: string) {
  if (status === 'pending') return 'sc-blue';
  if (status === 'done') return 'sc-green';
  if (status === 'makeup') return 'sc-makeup';
  return 'sc-dim';
}
function getStatusLabel(lesson: any) {
  if (lesson.status === 'pending') return t('groups.lessons.statusPending');
  if (lesson.status === 'done') return t('groups.lessons.statusDone');
  if (lesson.status === 'makeup') return `${t('groups.lessons.statusMakeup')} ${lesson.makeupDate}`;
  return '—';
}

const showAttModal = ref(false);
const showTopicModal = ref(false);
const activeLesson = ref<any>(null);

function openAttModal(lesson: any) { activeLesson.value = lesson; showAttModal.value = true; }
function openTopicModal(lesson: any) { activeLesson.value = lesson; showTopicModal.value = true; }
function setAtt(val: string) { if (activeLesson.value) activeLesson.value.att = val; }

onMounted(async () => {
  await st.loadGroups(studentId);
  if (st.groups[0]?.id) openIds.value = new Set([st.groups[0].id]);
});
</script>

<style scoped>
/* ── СТИЛИ ПРОГРАММИСТА (Скелетоны загрузки) ── */
.sk-wrap { display: flex; flex-direction: column; gap: 10px; }
.sk { height: 58px; border-radius: 14px; border: 1px solid var(--space-border, rgba(100,120,255,0.15)); background: rgba(255,255,255,.02); position: relative; overflow: hidden; }
.sk::after { content: ''; position: absolute; inset: -40px; transform: translateX(-60%); background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent); animation: sh 1.2s infinite; }
@keyframes sh { to { transform: translateX(120%); } }

/* ── БАЗОВЫЕ СТИЛИ ТАБОВ ── */
.sec-title { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #8892b0; display: flex; align-items: center; gap: 8px; margin-bottom: 10px; margin-top: 4px; }
.sec-title::after { content: ''; flex: 1; height: 1px; background: rgba(100,120,255,0.13); }
.prog-block { border: 1px solid rgba(100,120,255,0.13); border-radius: 14px; overflow: hidden; margin-bottom: 12px; transition: border-color .2s; background: rgba(10,10,32,0.97); }
.prog-block-toggle { display: flex; align-items: center; gap: 11px; padding: 12px 16px; cursor: pointer; background: rgba(255,255,255,.02); user-select: none; }
.prog-block-toggle:hover { background: rgba(255,255,255,.04); }
.prog-icon { width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900; }
.prog-icon-sm { background: linear-gradient(135deg, #4f6ef7, #8b5cf6); box-shadow: 0 0 10px rgba(79,110,247,.3); }
.prog-icon-ind { background: linear-gradient(135deg, #06b6d4, #8b5cf6); box-shadow: 0 0 10px rgba(6,182,212,.25); }
.prog-title-wrap { flex: 1; }
.prog-title { font-size: 13px; font-weight: 700; color: #e8eeff; }
.prog-subtitle { font-size: 11px; color: #8892b0; margin-top: 2px; }
.chip { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.chip-green { background: rgba(16,185,129,.12); color: #10b981; border: 1px solid rgba(16,185,129,.25); }
.prog-chevron { display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(100,120,255,0.13); background: rgba(255,255,255,.04); font-size: 11px; font-weight: 600; color: #8892b0; }
.prog-chevron-icon { display: inline-block; transition: transform .25s ease; font-style: normal; font-size: 10px; }
.prog-body { display: none; border-top: 1px solid rgba(100,120,255,0.13); }
.prog-body.open { display: block; }

/* ── КАРТОЧКА ГРУППЫ ── */
.cg-card { padding: 14px 16px 12px; background: rgba(255,255,255,.018); }
.cg-head { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 11px; }
.cg-badge { width: 38px; height: 38px; border-radius: 9px; flex-shrink: 0; background: linear-gradient(135deg, #4f6ef7, #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; box-shadow: 0 0 10px rgba(79,110,247,.28); color: white; }
.cg-badge-ind { background: linear-gradient(135deg, #06b6d4, #8b5cf6); }
.cg-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cg-name { font-size: 14px; font-weight: 700; color: #e8eeff; }
.cg-meta { font-size: 11.5px; color: #8892b0; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px 14px; }
.cg-cap { font-family: 'Space Mono', monospace; }
.cg-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; }
.cg-stat { text-align: center; padding: 8px 4px; background: rgba(255,255,255,.03); border: 1px solid rgba(100,120,255,0.13); border-radius: 8px; }
.cg-stat-val { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; color: #4f6ef7; }
.cg-stat-label { font-size: 10px; color: #8892b0; margin-top: 2px; }

/* ── ТАБЛИЦА УРОКОВ ── */
.table-wrapper { width: 100%; overflow-x: auto; padding-bottom: 8px; }
.lesson-table { width: 100%; border-collapse: collapse; }
.lesson-table th, .lesson-table td { white-space: nowrap; }
.lesson-table th { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #8892b0; padding: 6px 4px; text-align: left; border-bottom: 1px solid rgba(100,120,255,0.13); background: rgba(255,255,255,.012); }
.lesson-table td { padding: 7px 4px; font-size: 12px; color: #e8eeff; border-bottom: 1px solid rgba(100,120,255,.06); vertical-align: middle; }
.lesson-table th:first-child, .lesson-table td:first-child { padding-left: 12px; }

.lesson-num { font-family: 'Space Mono', monospace; font-size: 11px; color: #8892b0; }
.lesson-date { font-family: 'Space Mono', monospace; font-size: 11px; }

/* Улучшенные селекторы с ограничением ширины */
.topic-select { 
  background: rgba(255,255,255,.04); 
  border: 1px solid rgba(100,120,255,0.13); 
  border-radius: 7px; 
  padding: 4px 24px 4px 8px; 
  color: #e8eeff; 
  font-family: 'Outfit', sans-serif; 
  font-size: 11.5px; 
  outline: none; 
  width: 170px; 
  text-overflow: ellipsis; 
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  appearance: none; 
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238892b0'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
}
.topic-select.lvl2 { 
  background-color: rgba(139,92,246,.06); 
  border-color: rgba(139,92,246,.2); 
  color: #8b5cf6; 
  width: 140px;
}

.trainer-main { font-size: 12px; }
.trainer-sub { font-size: 10.5px; color: #f59e0b; margin-top: 1px; }

.topic-cell { display: flex; align-items: center; gap: 5px; }
.topic-hist-icon { font-size: 13px; cursor: pointer; opacity: .3; transition: opacity .15s; flex-shrink: 0; }
.topic-hist-icon:hover { opacity: 1; }
.topic-hist-has-log { opacity: 1; filter: drop-shadow(0 0 4px rgba(245,158,11,.5)); }

.att-dot { width: 26px; height: 26px; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer; transition: transform 0.15s; border: 1px solid transparent; }
.att-dot:hover { transform: scale(1.1); }
.att-ok { background: rgba(16,185,129,.12); color: #10b981; border-color: rgba(16,185,129,.25); }
.att-no { background: rgba(239,68,68,.1); color: #ef4444; border-color: rgba(239,68,68,.25); }
.att-future { background: rgba(255,255,255,.03); color: #8892b0; border-color: rgba(100,120,255,0.13); cursor: default; }
.att-future:hover { transform: none; }

.sc { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 5px; font-size: 10.5px; font-weight: 600; white-space: nowrap; }
.sc-green { background: rgba(16,185,129,.12); color: #10b981; border: 1px solid rgba(16,185,129,.25); }
.sc-blue { background: rgba(79,110,247,.12); color: #4f6ef7; border: 1px solid rgba(79,110,247,.25); }
.sc-makeup { background: rgba(6,182,212,.1); color: #06b6d4; border: 1px solid rgba(6,182,212,.25); }
.sc-dim { background: rgba(255,255,255,.05); color: #8892b0; border: 1px solid rgba(100,120,255,0.13); }

/* ── ИСТОРИЯ ── */
.history-wrap { padding: 14px 16px; background: rgba(255,255,255,.01); border-top: 1px solid rgba(100,120,255,0.13); }
.history-label { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #8892b0; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.history-label::after { content: ''; flex: 1; height: 1px; background: rgba(100,120,255,0.13); }
.history-flow { display: flex; flex-direction: column-reverse; position: relative; padding-left: 28px; }
.history-flow::before { content: ''; position: absolute; left: 10px; top: 12px; bottom: 12px; width: 2px; background: linear-gradient(to top, rgba(100,120,255,0.13), rgba(79,110,247,.35)); border-radius: 1px; }

.hi { display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; position: relative; }
.hi::before { content: ''; width: 10px; height: 10px; border-radius: 50%; position: absolute; left: -23px; top: 8px; border: 2px solid rgba(100,120,255,0.13); background: #04040f; }
.hi.hi-current::before { border-color: #4f6ef7; background: #4f6ef7; box-shadow: 0 0 6px rgba(79,110,247,.5); }
.hi-name { font-size: 12.5px; font-weight: 700; color: #e8eeff; }
.hi-dates { font-size: 11px; color: #8892b0; font-family: 'Space Mono', monospace; }
.hi-now { display: inline-flex; gap: 4px; margin-top: 3px; font-size: 10.5px; font-weight: 700; color: #10b981; background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.25); padding: 2px 8px; border-radius: 5px; }

.hi-arrow { display: flex; align-items: center; gap: 6px; padding: 5px 10px 5px 0; margin-bottom: 2px; }
.hi-arrow-icon { width: 18px; height: 18px; border-radius: 5px; background: rgba(245,158,11,.1); border: 1px solid rgba(245,158,11,.25); display: flex; align-items: center; justify-content: center; font-size: 10px; color: #f59e0b; }
.hi-arrow-text { font-size: 11px; color: #f59e0b; }

.hi-group-block { margin: 4px 0; }
.hi-expand-toggle { cursor: pointer; }
.hi-expand-toggle:hover .hi-name { color: #4f6ef7; }
.hi-expand-chevron { font-size: 10px; color: #8892b0; margin-left: 6px; display: inline-block; transition: transform .2s; }
.hi-group-block.open .hi-expand-chevron { transform: rotate(90deg); }

.btn-ghost { background: rgba(255,255,255,.05); color: #8892b0; border: 1px solid rgba(100,120,255,0.13); padding: 4px 8px; border-radius: 6px; cursor: pointer; }
.btn-ghost:hover { background: rgba(255,255,255,.08); color: #e8eeff; border-color: rgba(120,140,255,.3); }

/* ── МОДАЛЬНЫЕ ОКНА ── */
.att-popup-bd, .topic-popup-bd { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 600; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity .2s; }
.att-popup-bd.active, .topic-popup-bd.active { opacity: 1; pointer-events: all; }
.att-popup, .topic-popup { background: rgba(12,12,38,.99); border: 1px solid rgba(120,140,255,0.30); border-radius: 14px; width: 360px; padding: 20px; box-shadow: 0 20px 60px rgba(0,0,0,.7); transform: scale(.95) translateY(8px); transition: transform .2s; color: white;}
.att-popup-bd.active .att-popup, .topic-popup-bd.active .topic-popup { transform: scale(1) translateY(0); }
.att-popup-title, .topic-popup-title { font-size: 14px; font-weight: 700; margin-bottom: 3px; }
.att-popup-sub, .topic-popup-sub { font-size: 11.5px; color: #8892b0; margin-bottom: 14px; }
.att-toggle-row { display: flex; gap: 8px; margin-bottom: 16px; }
.att-choice { flex: 1; padding: 10px; border-radius: 10px; text-align: center; cursor: pointer; border: 2px solid rgba(100,120,255,0.13); transition: all .15s; }
.att-choice:hover { border-color: rgba(120,140,255,0.30); }
.att-choice.selected-ok { border-color: #10b981; background: rgba(16,185,129,.1); }
.att-choice.selected-no { border-color: #ef4444; background: rgba(239,68,68,.08); }
.att-choice-icon { font-size: 22px; }
.att-choice-label { font-size: 12px; font-weight: 600; margin-top: 4px; }
.att-popup-save { width: 100%; padding: 10px; border-radius: 9px; border: none; cursor: pointer; background: linear-gradient(135deg, #4f6ef7, #8b5cf6); color: #fff; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600; margin-top: 4px; transition: opacity .15s; }
.att-popup-save:hover { opacity: .88; }

.topic-log-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; background: rgba(255,255,255,.02); border: 1px solid rgba(100,120,255,0.13); border-radius: 9px; margin-bottom: 6px; }
.topic-log-num { width: 20px; height: 20px; border-radius: 5px; flex-shrink: 0; background: rgba(79,110,247,.15); border: 1px solid rgba(79,110,247,.25); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #4f6ef7; font-family: 'Space Mono', monospace; }
.topic-log-body { flex: 1; }
.topic-log-who { font-size: 12px; font-weight: 600; }
.topic-log-when { font-size: 10.5px; color: #8892b0; font-family: 'Space Mono', monospace; margin-bottom: 5px; }
.topic-log-change { display: flex; align-items: flex-start; gap: 6px; flex-wrap: wrap; }
.topic-log-from { background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.2); border-radius: 5px; padding: 2px 7px; font-size: 11px; color: #ef4444; text-decoration: line-through; }
.topic-log-arrow { color: #8892b0; font-size: 12px; padding-top: 2px; }
.topic-log-to { background: rgba(16,185,129,.08); border: 1px solid rgba(16,185,129,.2); border-radius: 5px; padding: 2px 7px; font-size: 11px; color: #10b981; font-weight: 600; }

.topic-popup-close { width: 100%; padding: 9px; border-radius: 9px; border: 1px solid rgba(100,120,255,0.13); background: transparent; color: #8892b0; font-family: 'Outfit', sans-serif; font-size: 12px; cursor: pointer; margin-top: 4px; transition: all .15s; }
.topic-popup-close:hover { border-color: rgba(120,140,255,0.30); color: #e8eeff; }
</style>