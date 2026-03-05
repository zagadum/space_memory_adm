<template>
  <BaseModal popupClass="popup-korekta">
    <div class="popup-title">📋 Корректура счёта</div>
    <div class="popup-sub">Создание корректировочного счёта (Faktura Korekta)</div>

    <!-- ── Исходный документ ── -->
    <div class="tx-info-card">
      <div class="tx-info-title">Исходный документ</div>
      <div class="tx-info-grid">
        <div class="tx-info-item">
          <span class="tx-info-label">№ СФ</span>
          <span class="tx-info-val">{{ fvnum }}</span>
        </div>
        <div class="tx-info-item">
          <span class="tx-info-label">Сумма</span>
          <span class="tx-info-val" style="color:var(--cyan)">{{ origAmount }} zł</span>
        </div>
        <div class="tx-info-item">
          <span class="tx-info-label">KSeF</span>
          <span class="kb" :class="'kb-' + ksefStatus">{{ KL[ksefStatus] }}</span>
        </div>
      </div>
    </div>

    <!-- ── Тип корректуры ── -->
    <div class="popup-label">Тип корректуры</div>
    <div class="radio-grid">
      <div class="radio-card" :class="{ active: corrType === 'full' }" @click="corrType = 'full'">
        <div class="radio-dot"></div>
        <div>
          <div class="radio-title">Полная корректура</div>
          <div class="radio-desc">Обнуление всей суммы</div>
        </div>
      </div>
      <div class="radio-card" :class="{ active: corrType === 'partial' }" @click="corrType = 'partial'">
        <div class="radio-dot"></div>
        <div>
          <div class="radio-title">Частичная корректура</div>
          <div class="radio-desc">Изменение суммы</div>
        </div>
      </div>
    </div>

    <!-- ── Новая сумма (только при частичной) ── -->
    <div v-if="corrType === 'partial'" class="fade-in" style="margin-top:14px">
      <div class="popup-2col">
        <div>
          <div class="popup-label">Новая сумма (PLN) <span style="color:var(--red)">*</span></div>
          <input class="popup-input amt-input" v-model.number="newAmount" type="number" min="0" />
        </div>
        <div>
          <div class="popup-label">Дата коррекции</div>
          <input class="popup-input" type="date" v-model="corrDate" />
        </div>
      </div>

      <!-- diff preview -->
      <div class="diff-preview" v-if="newAmount >= 0">
        <div class="dp-row">
          <span class="dp-lbl">Было</span>
          <span class="dp-val">{{ origAmount }} zł</span>
        </div>
        <div class="dp-row">
          <span class="dp-lbl">Станет</span>
          <span class="dp-val" style="color:var(--blue)">{{ newAmount }} zł</span>
        </div>
        <div class="dp-divider"></div>
        <div class="dp-row">
          <span class="dp-lbl">Разница</span>
          <span class="dp-val" :style="{ color: diffAmount < 0 ? 'var(--green)' : 'var(--red)' }">
            {{ diffAmount > 0 ? '+' : '' }}{{ diffAmount }} zł
          </span>
        </div>
      </div>
    </div>

    <!-- Дата коррекции (для полной) -->
    <div v-if="corrType === 'full'" style="margin-top:14px">
      <div class="popup-label">Дата коррекции</div>
      <input class="popup-input" type="date" v-model="corrDate" />
    </div>

    <!-- ── Причина ── -->
    <div style="margin-top:16px">
      <div class="popup-label">Причина корректировки <span style="color:var(--red)">*</span></div>
      <select class="popup-input" v-model="reasonId">
        <option value="" disabled>— выберите причину —</option>
        <option value="price_error">💲 Ошибка в цене</option>
        <option value="discount">🏷️ Предоставление скидки</option>
        <option value="return">↩️ Частичный возврат услуг</option>
        <option value="data_error">📝 Ошибка в реквизитах</option>
        <option value="other">❓ Другая причина</option>
      </select>
    </div>

    <!-- ── Комментарий ── -->
    <div style="margin-top:14px">
      <div class="popup-label">Комментарий (печать в счёте)</div>
      <textarea
        class="popup-input popup-textarea"
        v-model="comment"
        placeholder="Обоснование для бухгалтерии и KSeF..."
      ></textarea>
    </div>

    <!-- ── Warning ── -->
    <div class="info-box info-amber" style="margin-top:16px">
      <span>⚠️</span>
      <div>Корректура создаст новый документ <strong>FK/...</strong> в KSeF. Оригинальный счёт <strong>{{ fvnum }}</strong> будет помечен как скорректированный.</div>
    </div>

    <!-- ── Actions ── -->
    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">Отмена</button>
      <div v-if="errorMessage" class="info-box info-red" style="margin-bottom:8px;font-size:11px"><span>⚠️</span><div>{{ errorMessage }}</div></div>
      <button class="btn btn-primary-grad" :disabled="saving || !isValid" @click="save">
        {{ saving ? 'Отправка...' : '📋 Создать корректуру' }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import BaseModal from "../BaseModal.vue";
import { usePaymentsStore } from "../../stores/payments.store";
import { useModalStore } from "../../stores/modal.store";
import { paymentsApi } from "../../api/paymentsApi";

const paymentsStore = usePaymentsStore();
const modal = useModalStore();
const payload = modal.payload as any;
const tx = payload?.tx || {};

// Data from tx
const fvnum = tx.sub?.match(/FV\/[\d/]+/)?.[0] || tx.fvnum || "FV/2026/01/312";
const origAmount = tx.amount || 0;
const ksefStatus = tx.ksef || "ok";

// Form state
const corrType = ref<"full" | "partial">("full");
const newAmount = ref(origAmount);
const corrDate = ref(new Date().toISOString().split("T")[0]);
const reasonId = ref("");
const comment = ref("");
const saving = ref(false);
const errorMessage = ref('');

// Calculations
const diffAmount = computed(() => newAmount.value - origAmount);

// KSeF labels
const KL: Record<string, string> = {
  ok: "✓ Отправлен", manual: "✎ Ручной", pending: "⏳ Ожидает",
  error: "✕ Ошибка", conflict: "! Конфликт",
};

const isValid = computed(() => {
  if (!reasonId.value) return false;
  if (corrType.value === "partial" && (newAmount.value < 0 || newAmount.value === origAmount)) return false;
  return true;
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
</script>

<style scoped>
.popup-korekta { max-width: 500px; }
.popup-title { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
.popup-sub { font-size: 12px; color: var(--dim); margin-bottom: 16px; }

.popup-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .05em; color: var(--dim); margin-bottom: 5px;
}
.popup-input {
  background: rgba(255,255,255,.04); border: 1px solid var(--b);
  border-radius: 8px; padding: 9px 12px; color: var(--white);
  font-family: inherit; width: 100%; outline: none; font-size: 13px;
}
.popup-input:focus { border-color: var(--blue); background: rgba(255,255,255,.07); }
.popup-textarea { min-height: 70px; resize: vertical; line-height: 1.5; }
.popup-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.amt-input { color: var(--blue); font-family: 'Space Mono', monospace; font-weight: 700; font-size: 15px; }

/* Карточка исходного документа */
.tx-info-card {
  background: rgba(255,255,255,.03); border: 1px solid var(--b);
  border-radius: 12px; padding: 14px; margin-bottom: 18px;
}
.tx-info-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--dim); margin-bottom: 12px; letter-spacing: .8px; }
.tx-info-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 10px; }
.tx-info-item { display: flex; flex-direction: column; gap: 4px; }
.tx-info-label { font-size: 10px; color: var(--dim); }
.tx-info-val { font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700; }

.kb { font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 800; width: fit-content; }
.kb-ok { background: rgba(34,197,94,.1); color: #22c55e; border: 1px solid rgba(34,197,94,.2); }
.kb-manual { background: rgba(100,120,255,.08); color: var(--dim); border: 1px solid var(--b); }
.kb-pending { background: rgba(245,158,11,.1); color: var(--amber); border: 1px solid rgba(245,158,11,.2); }
.kb-error { background: rgba(239,68,68,.1); color: var(--red); border: 1px solid rgba(239,68,68,.2); }
.kb-conflict { background: rgba(249,115,22,.1); color: var(--orange); border: 1px solid rgba(249,115,22,.2); }

/* Radio cards */
.radio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; }
.radio-card {
  background: rgba(255,255,255,.02); border: 1px solid var(--b);
  border-radius: 10px; padding: 12px;
  display: flex; align-items: center; gap: 12px;
  cursor: pointer; transition: all .2s ease;
}
.radio-card:hover { border-color: var(--bh); background: rgba(255,255,255,.05); }
.radio-card.active { border-color: var(--blue); background: rgba(79,110,247,.08); }
.radio-dot {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid var(--b); position: relative; flex-shrink: 0;
}
.radio-card.active .radio-dot { border-color: var(--blue); }
.radio-card.active .radio-dot::after {
  content: ''; position: absolute; width: 8px; height: 8px;
  background: var(--blue); border-radius: 50%; top: 2px; left: 2px;
}
.radio-title { font-size: 13px; font-weight: 700; color: var(--white); }
.radio-desc { font-size: 11px; color: var(--dim); }

/* Diff preview */
.diff-preview {
  margin-top: 10px; padding: 12px;
  background: rgba(79,110,247,.05); border: 1px solid rgba(79,110,247,.15);
  border-radius: 9px; animation: fadeIn .18s ease;
}
.dp-row { display: flex; justify-content: space-between; padding: 3px 0; }
.dp-lbl { font-size: 12px; color: var(--dim); }
.dp-val { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; }
.dp-divider { height: 1px; background: rgba(79,110,247,.15); margin: 5px 0; }

/* Info box */
.info-box { border-radius: 8px; padding: 12px; font-size: 11px; display: flex; gap: 10px; line-height: 1.4; }
.info-amber { background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.2); color: #F59E0B; }

/* Actions */
.popup-actions { display: flex; gap: 10px; margin-top: 18px; }
.btn { flex: 1; padding: 11px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: .2s; }
.btn-ghost { background: rgba(255,255,255,.05); color: var(--dim); border: 1px solid var(--b); }
.btn-primary-grad { background: linear-gradient(135deg, var(--blue), var(--purple)); color: white; }
.btn-primary-grad:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
.btn:disabled { opacity: .3; cursor: not-allowed; }

.fade-in { animation: fadeIn .2s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>