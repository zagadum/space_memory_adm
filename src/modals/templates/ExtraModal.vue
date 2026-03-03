<template>
  <BaseModal popupClass="popup-extra">
    <div class="popup-title">➕ Доп. занятие</div>
    <div class="popup-sub">{{ programName }} · Anna Kowalska</div>

    <label class="popup-label">МЕСЯЦ ЗАНЯТИЯ</label>
    <div class="month-selector">
      <button
        v-for="(m, i) in months"
        :key="i"
        class="ms-btn"
        :class="{ active: selectedMonth === i }"
        @click="selectedMonth = i"
      >
        {{ m }}
      </button>
    </div>

    <label class="popup-label" style="margin-top:12px">УЧИТЕЛЬ ЗАНЯТИЯ</label>
    <select class="popup-input" v-model="selectedTeacher">
      <option value="ak">Anna Kowalska (основной тренер)</option>
      <option value="mw">Marek Wójcik</option>
      <option value="qa">Отдел Качества — проверка мотивации</option>
      <option value="other">Другой учитель</option>
    </select>

    <div class="info-box info-blue">
      <span>💡</span>
      <div>
        Цена 1 занятия = тариф ÷ 4 = <strong style="color:var(--white)">122.5 zł</strong><br>
        После авто-скидок (<span class="dc dc-family">−10% семья</span>): <strong style="color:var(--green)">≈ 98 zł</strong><br>
        <span style="font-size:10.5px">Отдельная транзакция и отдельный счёт KSeF. Карточка ➕ появится в сетке.</span>
      </div>
    </div>

    <div class="calc-preview">
      <div class="cp">
        <div class="cp-label">БАЗОВАЯ ЦЕНА</div>
        <div class="cp-val">122.5 zł</div>
      </div>
      <div class="cp" style="border-color:rgba(239,68,68,.2)">
        <div class="cp-label">АВТО-СКИДКА</div>
        <div class="cp-val" style="color:var(--red)">−24.5 zł</div>
      </div>
      <div class="cp" style="border-color:rgba(236,72,153,.3)">
        <div class="cp-label">К ОПЛАТЕ</div>
        <div class="cp-val" style="color:var(--pink)">{{ finalPrice }} zł</div>
      </div>
    </div>

    <label class="popup-label" style="margin-top:12px">ТЕМА ЗАНЯТИЯ <span style="font-size:10px;font-weight:400;color:var(--dim)">(ЗАПОЛНЯЕТСЯ УЧИТЕЛЕМ — НЕОБЯЗАТЕЛЬНО)</span></label>
    <input class="popup-input" v-model="topic" placeholder="напр. Повторение перед олимпиадой, проверка мотивации...">

    <div style="border-top:1px solid var(--b);padding-top:12px;margin-top:12px">
      <label class="popup-label">ДОПОЛНИТЕЛЬНАЯ СКИДКА <span style="font-size:10px;font-weight:400;color:var(--dim)">(НЕОБЯЗАТЕЛЬНО)</span></label>
      <input type="number" class="popup-input" v-model.number="extraDisc" placeholder="0 зл — оставить пустым если нет">
      
      <div v-if="extraDisc > 0" class="fade-in">
        <div class="info-box info-amber" style="margin-bottom:8px">
          <span>⚠️</span>
          <div>Дополнительная скидка требует <strong style="color:var(--white)">подтверждения руководителя</strong>.</div>
        </div>
        
        <label class="popup-label">ОБОСНОВАНИЕ СКИДКИ <span style="color:var(--red)">★</span></label>
        <input class="popup-input" v-model="discReason" placeholder="Опишите причину дополнительной скидки...">
        
        <label class="popup-label">ПОДТВЕРЖДАЕТ <span style="color:var(--red)">★</span></label>
        <div class="popup-2col" style="margin-bottom:0">
          <div class="reason-opt" :class="{ active: approver === 'account' }" @click="approver = 'account'">
            <input type="radio" :checked="approver === 'account'" style="accent-color:var(--blue); pointer-events: none;">
            <div><div style="font-weight:700;font-size:11.5px">📊 Бухгалтер</div></div>
          </div>
          <div class="reason-opt" :class="{ active: approver === 'dir' }" @click="approver = 'dir'">
            <input type="radio" :checked="approver === 'dir'" style="accent-color:var(--blue); pointer-events: none;">
            <div><div style="font-weight:700;font-size:11.5px">🎯 Директор ОК</div></div>
          </div>
        </div>
      </div>
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close" :disabled="saving">{{ t("common.cancel") }}</button>
      <button class="btn btn-pink" @click="save" :disabled="saving">
        {{ saving ? t("common.saving") : '➕ Добавить занятие' }}
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

const programId = modal.payload?.programId as string | undefined;
const programName = computed(() => programId === 'indigo' ? '⚡ Speedy Mind INDIGO' : '🌌 Space Memory');

// Логика UI
const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const selectedMonth = ref(new Date().getMonth());
const selectedTeacher = ref("ak");
const topic = ref("");
const extraDisc = ref<number | "">("");
const discReason = ref("");
const approver = ref("account");

const saving = ref(false);

// Расчет итоговой цены (98 зл - доп. скидка)
const finalPrice = computed(() => {
  const discount = typeof extraDisc.value === 'number' ? extraDisc.value : 0;
  return Math.max(0, 98 - discount);
});

function close() { 
  modal.close(); 
}

async function save() {
  if (!programId) return close();
  
  saving.value = true;
  try {
    // Передаем данные в API программиста
    await paymentsApi.addExtra({ 
      programId, 
      date: `2026-${String(selectedMonth.value + 1).padStart(2, '0')}-15`, // Генерируем фейковую дату из выбранного месяца
      title: topic.value || "Дополнительное занятие", 
      amount: finalPrice.value 
    });
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
/* ── СТИЛИ ДЛЯ ИНТЕРФЕЙСА ВНУТРИ МОДАЛКИ ── */
.popup-title { font-size: 15px; font-weight: 800; margin-bottom: 4px; }
.popup-sub { font-size: 11.5px; color: var(--dim); margin-bottom: 14px; line-height: 1.5; }
.popup-label { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--dim); margin-bottom: 5px; display: block; }
.popup-input { width: 100%; background: rgba(255,255,255,.04); border: 1px solid rgba(100,120,255,.13); border-radius: 8px; padding: 8px 12px; color: var(--white); font-family: 'Outfit', sans-serif; font-size: 13px; outline: none; transition: border-color .2s; margin-bottom: 12px; }
.popup-input:focus { border-color: var(--blue); }
.popup-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }

.month-selector { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; margin-bottom: 12px; }
.ms-btn { padding: 6px 3px; border-radius: 7px; font-size: 11px; font-weight: 600; text-align: center; cursor: pointer; border: 1px solid rgba(100,120,255,.13); background: transparent; color: var(--dim); transition: all .15s; font-family: 'Outfit', sans-serif; }
.ms-btn:hover { border-color: rgba(120,140,255,.30); color: var(--white); }
.ms-btn.active { background: rgba(79,110,247,.15); border-color: rgba(79,110,247,.4); color: var(--blue); }

.info-box { border-radius: 8px; padding: 9px 12px; font-size: 11.5px; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px; line-height: 1.5; }
.info-blue { background: rgba(79,110,247,.07); border: 1px solid rgba(79,110,247,.2); color: var(--dim); }
.info-amber { background: rgba(245,158,11,.07); border: 1px solid rgba(245,158,11,.22); color: var(--amber); }

.dc-family { display: inline-flex; align-items: center; gap: 3px; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; background: rgba(16,185,129,.1); color: var(--green); }

.calc-preview { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 12px; }
.cp { background: rgba(255,255,255,.03); border: 1px solid rgba(100,120,255,.13); border-radius: 9px; padding: 10px; text-align: center; }
.cp-label { font-size: 9.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--dim); margin-bottom: 5px; }
.cp-val { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; }

.reason-opt { display: flex; align-items: center; gap: 8px; padding: 9px 11px; background: rgba(255,255,255,.03); border: 1px solid rgba(100,120,255,.13); border-radius: 9px; cursor: pointer; transition: all .15s; }
.reason-opt:hover { border-color: rgba(120,140,255,.30); }
.reason-opt.active { border-color: rgba(79,110,247,.5); background: rgba(79,110,247,.1); }

.popup-actions { display: flex; gap: 8px; margin-top: 16px; }
.btn { flex: 1; display: inline-flex; justify-content: center; align-items: center; gap: 5px; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600; font-family: 'Outfit', sans-serif; cursor: pointer; border: none; transition: all .15s; }
.btn-ghost { background: rgba(255,255,255,.05); color: var(--dim); border: 1px solid rgba(100,120,255,.13); }
.btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,.08); color: var(--white); border-color: rgba(120,140,255,.30); }
.btn-pink { background: rgba(236,72,153,.1); color: var(--pink); border: 1px solid rgba(236,72,153,.28); }
.btn-pink:hover:not(:disabled) { background: rgba(236,72,153,.18); transform: translateY(-1px); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.fade-in { animation: fadeIn 0.2s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>
