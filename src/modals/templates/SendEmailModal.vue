<template>
  <BaseModal popupClass="popup-email-draft">
    <div class="popup-title">📧 {{ t('faktury.sendEmail') }}</div>
    <div class="popup-sub">{{ t('modals.invoice.emailSubtitle', { number: invoice.number }) }}</div>

    <div class="mt-4">
      <UiInput 
        v-model="form.subject" 
        :label="t('faktury.emailSubject') || 'Subject'" 
        required 
      />
    </div>

    <div class="mt-4">
      <div class="input-label mb-2">{{ t('faktury.emailBody') || 'Message' }}</div>
      <textarea 
        v-model="form.body" 
        class="custom-textarea" 
        rows="8"
        :placeholder="t('faktury.emailPlaceholder') || 'Enter your message...'"
      ></textarea>
      
      <div class="placeholders-hint mt-2">
        {{ t('faktury.placeholdersHint') || 'Available placeholders:' }} 
        <span class="placeholder-tag" @click="addPlaceholder('{{studentName}}')">{{ studentName }}</span>
        <span class="placeholder-tag" @click="addPlaceholder('{{invoiceNumber}}')">{{ invoice.number }}</span>
      </div>
    </div>

    <div class="mt-4 text-dim text-xs">
      ℹ️ {{ t('faktury.emailNote') || 'The PDF invoice will be attached automatically.' }}
    </div>

    <div class="mt-2 text-red" v-if="error">{{ error }}</div>

    <div class="popup-actions mt-4">
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

const { t } = useI18n();
const modal = useModalStore();
const invoicesStore = useInvoicesStore();

const loading = ref(false);
const error = ref<string | null>(null);

const studentName = computed(() => {
  if (!props.invoice.buyer_name) return 'Student';
  const parts = props.invoice.buyer_name.split(' ');
  return parts[0] || 'Student';
});

const form = reactive({
  subject: `Faktura ${props.invoice.number} — Global Leaders Skills`,
  body: '',
});

onMounted(() => {
  // Set default body
  form.body = `Cześć {{studentName}},\n\nW załączniku przesyłamy fakturę numer {{invoiceNumber}} za ostatnie zajęcia.\n\nPozdrawiamy,\nZespół Global Leaders Skills`;
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
.popup-email-draft { max-width: 600px; }

.custom-textarea {
  width: 100%;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 12px;
  color: var(--app-text-main);
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.2s;
  outline: none;
}

.custom-textarea:focus {
  border-color: var(--blue);
}

.input-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--app-text-main);
}

.placeholders-hint {
  font-size: 11px;
  color: var(--app-text-dim);
}

.placeholder-tag {
  background: rgba(79, 110, 247, 0.1);
  color: var(--blue);
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 4px;
  font-family: 'Space Mono', monospace;
}

.placeholder-tag:hover {
  background: rgba(79, 110, 247, 0.2);
}

.text-xs { font-size: 12px; }
</style>
