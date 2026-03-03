<template>
  <BaseModal popupClass="popup-pause">
    <div class="popup-title">❄️ {{ t("modals.pause.title") }}</div>
    <div class="popup-sub">Заморозка обучения с сохранением места в группе</div>

    <div class="pause-dates-grid">
      <div class="date-field">
        <div class="popup-label">{{ t("modals.pause.from") }}</div>
        <div class="input-with-icon">
          <span class="icon">📅</span>
          <input class="popup-input" type="date" v-model="from" @change="calculatePause" />
        </div>
      </div>
      <div class="date-field">
        <div class="popup-label">{{ t("modals.pause.to") }}</div>
        <div class="input-with-icon">
          <span class="icon">🏁</span>
          <input class="popup-input" type="date" v-model="to" @change="calculatePause" />
        </div>
      </div>
    </div>

    <div class="pause-summary-card" v-if="from && to && isValid">
      <div class="summary-header">
        <div class="summary-title">Итог заморозки</div>
        <div class="summary-badge">{{ totalDays }} дней</div>
      </div>
      
      <div class="lessons-counter">
        <div class="counter-item">
          <div class="counter-val">{{ totalPausedLessons }}</div>
          <div class="counter-label">зан. пропущено</div>
        </div>
        <div class="counter-divider"></div>
        <div class="counter-item">
          <div class="counter-val" style="color: var(--blue)">{{ totalPaidLessons }}</div>
          <div class="counter-label">зан. к оплате</div>
        </div>
      </div>

      <div class="month-progress-wrapper" v-for="m in affectedMonths" :key="m.name">
        <div class="month-meta">
          <span>{{ m.name }}</span>
          <span class="percent">{{ m.paused }} зан. в паузе</span>
        </div>
        <div class="dual-progress">
          <div class="segment paid" :style="{ width: (m.paid / m.total * 100) + '%' }"></div>
          <div class="segment paused" :style="{ width: (m.paused / m.total * 100) + '%' }"></div>
        </div>
      </div>
    </div>

    <div style="margin-top:16px">
      <div class="popup-label">Причина отсутствия <span style="color:var(--red)">*</span></div>
      <select class="popup-input" v-model="reason">
        <option value="vacation">🌴 Отпуск / Поездка</option>
        <option value="illness">🤒 Болезнь (нужна справка)</option>
        <option value="personal">🏠 Семейные обстоятельства</option>
        <option value="other">❓ Другое</option>
      </select>
    </div>

    <div style="margin-top:12px">
      <div class="popup-label">Комментарий (необязательно)</div>
      <div class="input-with-icon">
        <span class="icon">💬</span>
        <input 
          class="popup-input" 
          v-model="comment" 
          placeholder="Например: справка будет позже" 
        />
      </div>
    </div>

    <div class="warning-footer">
      <span class="warning-icon">⚠️</span>
      <p>Стоимость текущего месяца будет пересчитана. Место в группе фиксируется за учеником.</p>
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close" :disabled="saving">{{ t("common.cancel") }}</button>
      <button class="btn btn-cyan-grad" :disabled="saving || !isValid" @click="save">
        {{ saving ? t("common.saving") : 'Заморозить обучение' }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseModal from "../BaseModal.vue";
import { useModalStore } from "../../stores/modal.store";
import { paymentsApi } from "../../api/paymentsApi";

const { t } = useI18n();
const modal = useModalStore();

const programId = modal.payload?.programId;
const from = ref("");
const to = ref("");
const reason = ref("vacation");
const comment = ref("");
const saving = ref(false);

// Расписание (Пн и Чт для примера)
const scheduleDows = [1, 4]; 
const affectedMonths = ref<any[]>([]);

const isValid = computed(() => {
  if (!from.value || !to.value) return false;
  return new Date(from.value) <= new Date(to.value);
});

const totalDays = computed(() => {
  if (!isValid.value) return 0;
  const diff = new Date(to.value).getTime() - new Date(from.value).getTime();
  return Math.ceil(diff / (1000 * 3600 * 24)) + 1;
});

const totalPausedLessons = computed(() => affectedMonths.value.reduce((s, m) => s + m.paused, 0));
const totalPaidLessons = computed(() => affectedMonths.value.reduce((s, m) => s + m.paid, 0));

function calculatePause() {
  if (!isValid.value) {
    affectedMonths.value = [];
    return;
  }
  const start = new Date(from.value);
  const end = new Date(to.value);
  const months: any = {};

  let current = new Date(start);
  while (current <= end) {
    if (scheduleDows.includes(current.getDay())) {
      const mKey = current.toLocaleString('ru', { month: 'long' });
      if (!months[mKey]) months[mKey] = { name: mKey, paid: 0, paused: 0, total: 4 };
      months[mKey].paused++;
    }
    current.setDate(current.getDate() + 1);
  }
  affectedMonths.value = Object.values(months).map((m: any) => ({
    ...m,
    paid: Math.max(0, m.total - m.paused)
  }));
}

function close() { modal.close(); }

async function save() {
  if (!programId || !isValid.value) return close();
  saving.value = true;
  try {
    await paymentsApi.setPause({ 
      programId, 
      from: from.value, 
      to: to.value, 
      reason: reason.value,
      comment: comment.value
    });
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.popup-pause { max-width: 440px; }
.popup-title { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
.popup-sub { font-size: 12px; color: var(--dim); margin-bottom: 16px; }

.pause-dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 16px; }

.popup-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--dim); margin-bottom: 5px; letter-spacing: 0.5px; }

.input-with-icon { position: relative; display: flex; align-items: center; }
.input-with-icon .icon { position: absolute; left: 12px; font-size: 14px; z-index: 1; opacity: 0.7; }
.input-with-icon .popup-input { padding-left: 36px; }

.popup-input { 
  background: rgba(255,255,255,.04); 
  border: 1px solid var(--b); 
  border-radius: 8px; 
  padding: 10px 12px; 
  color: var(--white); 
  width: 100%; 
  outline: none; 
  font-family: inherit;
  font-size: 13px;
}
.popup-input:focus { border-color: var(--cyan); background: rgba(255,255,255,0.08); }

.pause-summary-card { 
  background: linear-gradient(145deg, rgba(6,182,212,0.1) 0%, rgba(6,182,212,0.02) 100%);
  border: 1px solid rgba(6,182,212,0.25);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.summary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.summary-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--cyan); }
.summary-badge { background: var(--cyan); color: #000; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 800; }

.lessons-counter { display: flex; align-items: center; justify-content: space-around; text-align: center; margin-bottom: 16px; }
.counter-val { font-family: 'Space Mono', monospace; font-size: 26px; font-weight: 700; color: var(--cyan); line-height: 1; }
.counter-label { font-size: 10px; color: var(--dim); margin-top: 4px; }
.counter-divider { width: 1px; height: 24px; background: rgba(255,255,255,0.1); }

.month-meta { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; font-weight: 600; text-transform: capitalize; }
.dual-progress { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; display: flex; overflow: hidden; }
.segment.paid { background: var(--blue); opacity: 0.6; }
.segment.paused { background: var(--cyan); box-shadow: 0 0 8px rgba(6,182,212,0.3); }

.warning-footer { display: flex; gap: 10px; margin-top: 15px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
.warning-icon { font-size: 14px; }
.warning-footer p { font-size: 10px; color: var(--dim); line-height: 1.4; margin: 0; }

.popup-actions { display: flex; gap: 10px; margin-top: 20px; }
.btn { flex: 1; padding: 11px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; }
.btn-ghost { background: rgba(255,255,255,.05); color: var(--dim); border: 1px solid var(--b); }
.btn-cyan-grad { background: linear-gradient(135deg, var(--cyan), #0891b2); color: #000; font-weight: 700; }
.btn-cyan-grad:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
.btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>