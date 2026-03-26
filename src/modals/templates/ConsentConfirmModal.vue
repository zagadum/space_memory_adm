<template>
  <BaseModal popupClass="popup-consent">
    <div class="popup-title">{{ payload.consentIcon }} {{ payload.consentLabel }}</div>
    
    <div class="confirm-box" :class="payload.newValue ? 'box-green' : 'box-red'">
      <div class="confirm-msg">
        {{ payload.newValue ? t('modals.consent.confirmAgree') : t('modals.consent.confirmRefuse') }}
      </div>
    </div>

    <div class="popup-field">
      <div class="popup-label">{{ t("modals.consent.commentLabel") }} <span class="required">*</span></div>
      <textarea 
        class="popup-input popup-textarea" 
        v-model="comment" 
        :placeholder="t('modals.consent.commentPlaceholder')"
      ></textarea>
      <div class="popup-hint">{{ t("modals.consent.commentHint") }}</div>
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close" :disabled="saving">{{ t("common.cancel") }}</button>
      <button 
        class="btn" 
        :class="payload.newValue ? 'btn-green-grad' : 'btn-red-grad'" 
        :disabled="saving || !comment.trim()" 
        @click="confirm"
      >
        {{ saving ? t("common.saving") : t('common.confirm') }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
 romance: true
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import BaseModal from "../BaseModal.vue";
import { useModalStore } from "../../stores/modal.store";
import { useNewStudentsStore } from "../../stores/newStudents.store";

const { t } = useI18n();
const modal = useModalStore();
const store = useNewStudentsStore();

const payload = modal.payload || {};
const comment = ref("");
const saving = ref(false);

function close() { modal.close(); }

async function confirm() {
  if (!payload.studentId || !payload.consentKey) return close();
  
  saving.value = true;
  try {
    await store.saveDetails(payload.studentId, {
      [payload.consentKey]: payload.newValue
    }, undefined, comment.value);
    modal.close();
  } catch (e) {
    console.error('Failed to confirm consent change:', e);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.popup-consent { max-width: 400px; }

.confirm-box {
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid transparent;
}
.box-green {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}
.box-red {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
  color: #f87171;
}
.confirm-msg {
  font-size: 14px;
  font-weight: 600;
}

.popup-field { margin-bottom: 16px; }
.popup-label { 
  font-size: 11px; font-weight: 700; text-transform: uppercase; 
  color: var(--app-text-dim); margin-bottom: 8px; letter-spacing: 0.05em; 
}
.required { color: #ef4444; }

.popup-input { 
  background: var(--app-card); 
  border: 1px solid var(--app-border); 
  border-radius: 8px; 
  padding: 10px 12px; 
  color: var(--app-text-main); 
  width: 100%; 
  outline: none; 
  font-family: inherit;
  font-size: 13.5px;
  transition: all 0.2s;
}
.popup-input:focus { border-color: #4f6ef7; box-shadow: 0 0 12px rgba(79, 110, 247, 0.15); }
.popup-textarea { min-height: 80px; resize: vertical; }
.popup-hint { font-size: 11px; color: var(--app-text-dim); margin-top: 6px; }

.popup-actions { display: flex; gap: 10px; margin-top: 24px; }
.btn { flex: 1; padding: 11px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; }
.btn-ghost { background: var(--app-card); color: var(--app-text-dim); border: 1px solid var(--app-border); }
.btn-ghost:hover { background: var(--app-surface); color: var(--app-text-main); }

.btn-green-grad { 
  background: linear-gradient(135deg, #10b981, #059669); 
  color: white; 
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}
.btn-red-grad { 
  background: linear-gradient(135deg, #ef4444, #b91c1c); 
  color: white; 
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}
.btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
</style>
