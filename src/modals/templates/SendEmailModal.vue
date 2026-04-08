<template>
  <BaseModal popupClass="popup-email-draft">
    <div class="popup-title">📧 {{ t('faktury.sendEmail') }}</div>
    <div class="popup-sub">{{ t('modals.invoice.emailSubtitle', { number: invoice.number }) }}</div>

    <div class="mt-5">
      <UiInput 
        v-model="form.subject" 
        :label="t('faktury.emailSubject')" 
        required 
      />
    </div>

    <div class="mt-4">
      <div class="popup-label mb-2">{{ t('faktury.emailBody') }}</div>
      <div class="editor-container">
        <textarea 
          v-model="form.body" 
          class="custom-textarea" 
          rows="10"
          :placeholder="t('faktury.emailPlaceholder') || 'Enter your message...'"
        ></textarea>
        
        <div class="editor-footer">
          <div class="placeholders-hint">
            {{ t('faktury.placeholdersHint') }} 
            <div class="tags-group">
              <span class="placeholder-tag" @click="addPlaceholder('{{studentName}}')">{{ studentName }}</span>
              <span class="placeholder-tag" @click="addPlaceholder('{{invoiceNumber}}')">{{ invoice.number }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-note mt-4">
      <span class="info-icon">📎</span>
      <span>{{ t('faktury.emailNote') }}</span>
    </div>

    <div class="mt-2 text-danger" v-if="error">{{ error }}</div>

    <div class="popup-actions mt-5">
      <UiButton variant="ghost" @click="modal.close">{{ t('common.cancel') }}</UiButton>
      <UiButton 
        variant="primary" 
        :loading="loading" 
        :disabled="!isFormValid || loading" 
        @click="submit"
      >
        {{ t('common.send') }}
      </UiButton>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseModal from '../BaseModal.vue';
import UiInput from '../../components/ui/UiInput.vue';
import UiButton from '../../components/ui/UiButton.vue';
import { useModalStore } from '../../stores/modal.store';
import { useInvoicesStore } from '../../stores/invoices.store';

const props = defineProps<{
  invoice: any;
}>();

const { t, locale } = useI18n();
const modal = useModalStore();
const invoicesStore = useInvoicesStore();

const loading = ref(false);
const error = ref<string | null>(null);

const studentName = computed(() => {
  if (!props.invoice.buyer_name) return 'Student / Client';
  const parts = props.invoice.buyer_name.split(' ');
  return parts[0] || 'Student / Client';
});

const form = reactive({
  subject: '',
  body: '',
});

onMounted(() => {
  // Set default localized content
  const isEn = locale.value === 'en';
  const isPl = locale.value === 'pl';
  
  if (isPl) {
    form.subject = `Faktura ${props.invoice.number} — Global Leaders Skills`;
    form.body = `Dzień dobry {{studentName}},\n\nW załączniku przesyłamy fakturę numer {{invoiceNumber}} za ostatnie zajęcia.\n\nPozdrawiamy,\nZespół Global Leaders Skills`;
  } else if (isEn) {
    form.subject = `Invoice ${props.invoice.number} — Global Leaders Skills`;
    form.body = `Hello {{studentName}},\n\nPlease find attached invoice number {{invoiceNumber}} for your recent classes.\n\nBest regards,\nGlobal Leaders Skills Team`;
  } else {
    // Default to RU/UK pattern (using PL strings as placeholder if not specified, 
    // but usually these are handled by backend templates, here we just provide a draft)
    form.subject = `Faktura ${props.invoice.number} — Global Leaders Skills`;
    form.body = `Здравствуйте {{studentName}},\n\nВо вложении направляем счет №{{invoiceNumber}} за обучение.\n\nС уважением,\nКоманда Global Leaders Skills`;
  }
});

const isFormValid = computed(() => {
  return form.subject.trim().length > 3 && form.body.trim().length > 10;
});

function addPlaceholder(ph: string) {
  form.body += ph;
}

async function submit() {
  loading.value = true;
  error.value = null;
  try {
    await invoicesStore.sendInvoiceEmail(props.invoice.id, {
      subject: form.subject,
      body: form.body,
    });
    modal.close();
  } catch (err: any) {
    error.value = err.message || 'Error sending email';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.popup-email-draft { max-width: 620px; }

.popup-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--dim, #8892b0);
}

.editor-container {
  border: 1px solid rgba(100, 120, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  overflow: hidden;
  transition: border-color 0.2s;
}

.editor-container:focus-within {
  border-color: var(--blue);
}

.custom-textarea {
  width: 100%;
  background: transparent;
  border: none;
  padding: 16px;
  color: white;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
}

.editor-footer {
  background: rgba(255, 255, 255, 0.04);
  padding: 10px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.placeholders-hint {
  font-size: 11px;
  color: var(--dim);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.tags-group {
  display: flex;
  gap: 6px;
}

.placeholder-tag {
  background: rgba(79, 110, 247, 0.12);
  color: var(--blue);
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  transition: all 0.2s;
  border: 1px solid rgba(79, 110, 247, 0.2);
}

.placeholder-tag:hover {
  background: var(--blue);
  color: white;
  transform: translateY(-1px);
}

.info-note {
  display: flex;
  gap: 10px;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12px;
  color: var(--dim);
}

.info-icon { font-size: 16px; }

.text-danger { 
  color: #ff5555; 
  font-size: 12px; 
  padding: 10px;
  background: rgba(255, 0, 0, 0.05);
  border-radius: 8px;
  margin-top: 12px;
}

.mt-5 { margin-top: 32px; }
</style>
