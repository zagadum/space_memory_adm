<template>
  <BaseModal popupClass="popup-pause">
    <div class="popup-title">🌙 {{ t("modals.pause.title") }}</div>
    <div class="popup-sub">{{ t("modals.pause.scheduleHint1") }} <strong style="color:var(--white)">{{ t("modals.pause.scheduleHint2") }}</strong> {{ t("modals.pause.scheduleHint3") }}</div>

    <div class="popup-2col">
      <div>
        <label class="popup-label">{{ t("modals.pause.from") }}</label>
        <input type="date" class="popup-input" v-model="from" @change="calcPause" style="margin-bottom:0" />
      </div>
      <div>
        <label class="popup-label">{{ t("modals.pause.to") }}</label>
        <input type="date" class="popup-input" v-model="to" @change="calcPause" style="margin-bottom:0" />
      </div>
    </div>
    <div style="font-size:10.5px;color:var(--dim);margin-bottom:12px;margin-top:4px">💡 {{ t("modals.pause.datesHint") }}</div>

    <!-- Calculation block — visible only when both dates are filled -->
    <div v-if="monthRows.length > 0">
      <div class="pause-calc">
        <div class="pause-calc-title">{{ t("modals.pause.calcTitle") }} ({{ scheduleLabel }})</div>
        <div v-for="(m, i) in monthRows" :key="i" class="pause-month-row">
          <div class="pmr-name">{{ m.label }}</div>
          <div class="pmr-bar"><div class="pmr-fill" :style="{ width: m.pct * 100 + '%', background: m.pct > 0 ? 'var(--green)' : 'var(--amber)' }"></div></div>
          <div class="pmr-amt" :style="{ color: m.pct > 0 ? 'var(--green)' : 'var(--amber)' }">{{ m.amt > 0 ? m.amt + ' zł' : '0 zł' }}</div>
          <div class="pmr-note">{{ m.active }}/{{ m.total }} {{ t("modals.pause.lessons") }}<template v-if="m.bonusCount > 0"> ({{ m.bonusCount }} {{ t("modals.pause.bonusLesson") }})</template> · {{ m.status }}</div>
        </div>
      </div>

      <!-- Info: invoices -->
      <div class="info-box info-blue">
        <span>📋</span>
        <div><strong style="color:var(--white)">{{ t("modals.pause.invoicesTitle") }}</strong> {{ t("modals.pause.invoicesText") }}</div>
      </div>

      <!-- Info: quality dept -->
      <div class="info-box info-amber">
        <span>📞</span>
        <div>{{ t("modals.pause.qualityText1") }} <strong style="color:var(--white)">{{ t("modals.pause.qualityText2") }}</strong> {{ t("modals.pause.qualityText3") }}</div>
      </div>
    </div>

    <!-- Reason -->
    <label class="popup-label">{{ t("modals.pause.reason") }} <span style="color:var(--red)">★</span></label>
    <select class="popup-input" v-model="reason">
      <option value="">— {{ t("modals.pause.selectReason") }} —</option>
      <option value="illness">{{ t("modals.pause.reasons.illness") }}</option>
      <option value="trip">{{ t("modals.pause.reasons.trip") }}</option>
      <option value="exams">{{ t("modals.pause.reasons.exams") }}</option>
      <option value="family">{{ t("modals.pause.reasons.family") }}</option>
      <option value="other">{{ t("modals.pause.reasons.other") }}</option>
    </select>

    <!-- Comment -->
    <label class="popup-label">{{ t("modals.pause.comment") }} <span style="font-size:10px;font-weight:400;color:var(--dim)">({{ t("modals.pause.optional") }})</span></label>
    <input class="popup-input" v-model="comment" :placeholder="t('modals.pause.commentPlaceholder')" />

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close" :disabled="saving">{{ t("common.cancel") }}</button>
      <div v-if="errorMessage" class="info-box info-red" style="margin-bottom:8px;font-size:11px"><span>⚠️</span><div>{{ errorMessage }}</div></div>
      <button class="btn btn-amber" :disabled="saving || !isValid" @click="save">
        {{ saving ? t("common.saving") : '🌙 ' + t("modals.pause.apply") }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseModal from "../BaseModal.vue";
import { usePaymentsStore } from "../../stores/payments.store";
import { useModalStore } from "../../stores/modal.store";

const { t } = useI18n();
const paymentsStore = usePaymentsStore();
const modal = useModalStore();

const from = ref("");
const to = ref("");
const reason = ref("");
const comment = ref("");
const saving = ref(false);
const errorMessage = ref('');

// Schedule: Monday (1) — default. In production, comes from group data
const scheduleDow = 1;
const scheduleLabel = computed(() => {
  const DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return DAYS[scheduleDow] + ' 16:00';
});

// Full month names for calc display
const MONTHS_SHORT: Record<string, string[]> = {
  ru: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  pl: ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'],
  uk: ['Січ','Лют','Бер','Кві','Тра','Чер','Лип','Сер','Вер','Жов','Лис','Гру'],
};

interface MonthCalcRow {
  label: string;
  total: number;
  active: number;
  amt: number;
  pct: number;
  status: string;
  bonusCount: number;
}

const monthRows = ref<MonthCalcRow[]>([]);

const isValid = computed(() => {
  if (!from.value || !to.value || !reason.value) return false;
  return new Date(from.value) <= new Date(to.value);
});

/**
 * Schedule-based pause calculation with BONUS logic.
 * If a month has 5 occurrences of the schedule day:
 *   - The 5th lesson is ALWAYS free (bonus).
 *   - perLesson = tariff / 4 (not 5).
 * Active (non-paused) lessons are priced accordingly:
 *   - If the bonus lesson is active → it costs 0 zł.
 *   - Other active lessons → tariff / 4 each.
 */
function calcPause() {
  if (!from.value || !to.value) {
    monthRows.value = [];
    return;
  }
  const fDate = new Date(from.value);
  const tDate = new Date(to.value);
  if (fDate > tDate) {
    monthRows.value = [];
    return;
  }

  const locale = (document.documentElement.lang || 'ru').substring(0, 2);
  const mNames = MONTHS_SHORT[locale] || MONTHS_SHORT['ru'];

  // Default tariff — in production, comes from the active program
  const tariff = paymentsStore.programs?.[0]?.tariff || 490;

  const result: MonthCalcRow[] = [];
  const d = new Date(fDate.getFullYear(), fDate.getMonth(), 1);

  while (d <= new Date(tDate.getFullYear(), tDate.getMonth(), 1)) {
    const yr = d.getFullYear();
    const mo = d.getMonth();

    // Find all schedule days (e.g., Mondays) in this month
    const scheduleDays: Date[] = [];
    const day = new Date(yr, mo, 1);
    while (day.getMonth() === mo) {
      if (day.getDay() === scheduleDow) {
        scheduleDays.push(new Date(day));
      }
      day.setDate(day.getDate() + 1);
    }

    const total = scheduleDays.length;
    const hasBonus = total === 5;
    // Per-lesson cost: always tariff / 4 (bonus 5th is free)
    const perLesson = hasBonus ? tariff / 4 : (total > 0 ? tariff / total : 0);

    // Determine which lessons are active (not on pause)
    const pad = (n: number) => String(n).padStart(2, '0');
    const activeLessons: boolean[] = scheduleDays.map(sd => {
      if (yr === fDate.getFullYear() && mo === fDate.getMonth() &&
          yr === tDate.getFullYear() && mo === tDate.getMonth()) {
        // Same month — active if before pause start OR after pause end
        return sd < fDate || sd >= tDate;
      } else if (yr === fDate.getFullYear() && mo === fDate.getMonth()) {
        return sd < fDate; // first month – active only before pause
      } else if (yr === tDate.getFullYear() && mo === tDate.getMonth()) {
        return sd >= tDate; // last month – active from return date
      } else {
        return false; // full pause month
      }
    });

    const active = activeLessons.filter(Boolean).length;

    // Calculate amount: sum cost of active lessons, bonus (5th, index 4) = 0
    let amt = 0;
    let bonusCount = 0;
    activeLessons.forEach((isActive, idx) => {
      if (isActive) {
        if (hasBonus && idx === 4) {
          // 5th lesson is bonus → 0 zł
          bonusCount++;
        } else {
          amt += perLesson;
        }
      }
    });
    amt = Math.round(amt);

    // Count bonus lessons in pause (for info)
    if (hasBonus) {
      activeLessons.forEach((isActive, idx) => {
        if (!isActive && idx === 4) {
          bonusCount++; // bonus fell into pause
        }
      });
    }

    let status = '';
    if (yr === fDate.getFullYear() && mo === fDate.getMonth() &&
        yr === tDate.getFullYear() && mo === tDate.getMonth()) {
      status = `частичная · пауза ${fDate.getDate()}.${pad(mo + 1)}–${tDate.getDate()}.${pad(mo + 1)}`;
    } else if (yr === fDate.getFullYear() && mo === fDate.getMonth()) {
      status = `пауза с ${fDate.getDate()}.${pad(mo + 1)} · возврат: ${tDate.getDate()}.${pad(tDate.getMonth() + 1)}`;
    } else if (yr === tDate.getFullYear() && mo === tDate.getMonth()) {
      status = `↩ возврат ${tDate.getDate()}.${pad(mo + 1)}`;
    } else {
      status = 'полная пауза';
    }

    const pct = total > 0 ? active / total : 0;
    const label = mNames[mo] + ' ' + yr;

    result.push({ label, total, active, amt, pct, status, bonusCount });
    d.setMonth(d.getMonth() + 1);
  }

  monthRows.value = result;
}

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
</script>

<style scoped>
/* ── POPUP BASE ── */
.popup-pause { max-width: 500px; }
.popup-title { font-size: 15px; font-weight: 800; margin-bottom: 4px; }
.popup-sub { font-size: 12px; color: var(--dim); margin-bottom: 16px; line-height: 1.5; }

.popup-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
.popup-label { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--dim); margin-bottom: 5px; display: block; }
.popup-input {
  width: 100%;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--b);
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--white);
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  outline: none;
  transition: border-color .2s;
  margin-bottom: 12px;
}
.popup-input:focus { border-color: var(--blue); }

/* ── SCHEDULE CALC BLOCK ── */
.pause-calc {
  background: rgba(255,255,255,.02);
  border: 1px solid var(--b);
  border-radius: 10px;
  padding: 11px;
  margin-bottom: 12px;
}
.pause-calc-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--dim);
  margin-bottom: 9px;
}
.pause-month-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
  font-size: 12px;
}
.pmr-name { width: 75px; font-weight: 600; flex-shrink: 0; }
.pmr-bar { flex: 1; height: 5px; border-radius: 3px; background: rgba(255,255,255,.06); overflow: hidden; }
.pmr-fill { height: 100%; border-radius: 3px; }
.pmr-amt { font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; width: 60px; text-align: right; flex-shrink: 0; }
.pmr-note { font-size: 10px; color: var(--dim); flex: 1; }

/* ── INFO BOXES ── */
.info-box { border-radius: 8px; padding: 9px 12px; font-size: 11.5px; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px; line-height: 1.5; }
.info-blue { background: rgba(79,110,247,.07); border: 1px solid rgba(79,110,247,.2); color: var(--dim); }
.info-amber { background: rgba(245,158,11,.07); border: 1px solid rgba(245,158,11,.22); color: var(--amber); }
.info-red { background: rgba(239,68,68,.07); border: 1px solid rgba(239,68,68,.2); color: var(--red); }

/* ── ACTIONS ── */
.popup-actions { display: flex; gap: 10px; margin-top: 20px; }
.btn { flex: 1; padding: 11px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; }
.btn-ghost { background: rgba(255,255,255,.05); color: var(--dim); border: 1px solid var(--b); }
.btn-amber { background: rgba(245,158,11,.1); color: var(--amber); border: 1px solid rgba(245,158,11,.28); font-weight: 700; }
.btn-amber:hover:not(:disabled) { background: rgba(245,158,11,.18); }
.btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>