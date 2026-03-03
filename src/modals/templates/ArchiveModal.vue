<template>
  <BaseModal popupClass="popup-archive">
    <div class="popup-title">📦 {{ t("modals.archive.title") }}</div>
    <div class="popup-sub">Завершение программы и перенос в архив</div>

    <div class="info-box info-red">
      <span>⚠️</span>
      <div><strong>Внимание:</strong> Это действие остановит все будущие начисления. Место в группе будет освобождено для других учеников.</div>
    </div>

    <div style="margin-bottom: 16px;">
      <div class="popup-label">Дата последнего занятия <span style="color:var(--red)">*</span></div>
      <div class="input-with-icon">
        <span class="icon">📅</span>
        <input class="popup-input" type="date" v-model="endDate" />
      </div>
    </div>

    <div style="margin-bottom: 16px;">
      <div class="popup-label">Причина завершения <span style="color:var(--red)">*</span></div>
      <select class="popup-input" v-model="reason">
        <option value="" disabled>— Выберите из списка —</option>
        <option value="finished">🎓 Успешное окончание курса</option>
        <option value="relocation">✈️ Переезд / Смена жительства</option>
        <option value="schedule">⏰ Не подходит расписание</option>
        <option value="financial">💸 Финансовые причины</option>
        <option value="quality">👎 Недовольство качеством</option>
        <option value="other">📝 Другое (укажите ниже)</option>
      </select>
    </div>

    <div style="margin-bottom: 20px;">
      <div class="popup-label">Подробный комментарий</div>
      <textarea 
        class="popup-input popup-textarea" 
        v-model="comment" 
        placeholder="Напишите подробнее, почему ученик уходит. Эта информация поможет нам стать лучше..."
      ></textarea>
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close" :disabled="saving">{{ t("common.cancel") }}</button>
      <button class="btn btn-red-grad" :disabled="saving || !isValid" @click="confirm">
        {{ saving ? t("common.saving") : 'Завершить и архивировать' }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import BaseModal from "../BaseModal.vue";
import { useModalStore } from "../../stores/modal.store";
import { paymentsApi } from "../../api/paymentsApi";

const { t } = useI18n();
const modal = useModalStore();

const payload = modal.payload;
const programId = payload?.programId as string | undefined;

const endDate = ref(new Date().toISOString().split('T')[0]); // По умолчанию сегодня
const reason = ref("");
const comment = ref("");
const saving = ref(false);

const isValid = computed(() => {
  return endDate.value !== "" && reason.value !== "";
});

function close(){ modal.close(); }

async function confirm(){
  if (!programId) return close();
  saving.value = true;
  try{
    // Отправляем расширенные данные согласно DevGuide (раздел 12.1)
    await paymentsApi.archiveProgram({ 
      programId, 
      endDate: endDate.value,
      reason: reason.value,
      comment: comment.value 
    });
    modal.close();
  } catch (e) {
    console.error(e);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.popup-archive { max-width: 420px; }

.info-box { 
  border-radius: 10px; 
  padding: 12px 16px; 
  font-size: 11px; 
  display: flex; 
  gap: 12px; 
  line-height: 1.5; 
  margin-bottom: 20px;
  background: rgba(239, 68, 68, 0.08); 
  border: 1px solid rgba(239, 68, 68, 0.2); 
  color: #fca5a5;
}

.input-with-icon { position: relative; display: flex; align-items: center; }
.input-with-icon .icon { position: absolute; left: 12px; font-size: 14px; opacity: 0.8; }
.input-with-icon .popup-input { padding-left: 38px; }

.popup-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--dim); margin-bottom: 6px; letter-spacing: 0.05em; }

.popup-input { 
  background: rgba(255,255,255,.03); 
  border: 1px solid var(--b); 
  border-radius: 8px; 
  padding: 10px 12px; 
  color: var(--white); 
  width: 100%; 
  outline: none; 
  font-family: inherit;
  font-size: 13px;
  transition: .2s;
}
.popup-input:focus { border-color: var(--red); background: rgba(255,255,255,.06); }

.popup-textarea { min-height: 90px; resize: vertical; line-height: 1.5; }

.popup-actions { display: flex; gap: 10px; margin-top: 25px; }
.btn { flex: 1; padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: .2s; }
.btn-ghost { background: rgba(255,255,255,.05); color: var(--dim); }

.btn-red-grad { 
  background: linear-gradient(135deg, #ef4444, #991b1b); 
  color: white; 
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}
.btn-red-grad:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); box-shadow: 0 6px 15px rgba(239, 68, 68, 0.3); }
.btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none !important; }
</style>