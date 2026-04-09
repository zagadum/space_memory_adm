<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '../BaseModal.vue'
import UiInput from '../../components/ui/UiInput.vue'
import UiButton from '../../components/ui/UiButton.vue'
import { useModalStore } from '../../stores/modal.store'
import { useInvoicesStore } from '../../stores/invoices.store'

const props = defineProps<{
  invoice: any
}>()

const { t, locale } = useI18n()
const modal = useModalStore()
const invoicesStore = useInvoicesStore()

const loading = ref(false)
const error = ref<string | null>(null)

const studentName = computed(() => {
  if (!props.invoice.buyer_name) return 'Student / Client'
  const parts = props.invoice.buyer_name.split(' ')
  return parts[0] || 'Student / Client'
})

const form = reactive({
  subject: '',
  body: '',
})

onMounted(() => {
  const isEn = locale.value === 'en'
  const isPl = locale.value === 'pl'
  
  if (isPl) {
    form.subject = `Faktura ${props.invoice.number} — Global Leaders Skills`
    form.body = `Dzień dobry {{studentName}},\n\nW załączniku przesyłamy fakturę numer {{invoiceNumber}} za ostatnie zajęcia.\n\nPozdrawiamy,\nZespół Global Leaders Skills`
  } else if (isEn) {
    form.subject = `Invoice ${props.invoice.number} — Global Leaders Skills`
    form.body = `Hello {{studentName}},\n\nPlease find attached invoice number {{invoiceNumber}} for your recent classes.\n\nBest regards,\nGlobal Leaders Skills Team`
  } else {
    form.subject = `Faktura ${props.invoice.number} — Global Leaders Skills`
    form.body = `Здравствуйте {{studentName}},\n\nВо вложении направляем счет №{{invoiceNumber}} за обучение.\n\nС уважением,\nКоманда Global Leaders Skills`
  }
})

const isFormValid = computed(() => {
  return form.subject.trim().length > 3 && form.body.trim().length > 10
})

const addPlaceholder = (ph: string) => {
  form.body += ph
}

const submit = async () => {
  loading.value = true
  error.value = null
  try {
    await invoicesStore.sendInvoiceEmail(props.invoice.id, {
      subject: form.subject,
      body: form.body,
    })
    modal.close()
  } catch (err: any) {
    error.value = err.message || 'Error sending email'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal popupClass="popup-email-draft">
    <div class="modal-header">
      <div class="header-icon">📧</div>
      <div class="header-text">
        <h2 class="popup-title">{{ t('faktury.sendEmail') }}</h2>
        <p class="popup-sub">{{ t('modals.invoice.emailSubtitle', { number: invoice.number }) }}</p>
      </div>
    </div>

    <div class="scroll-body">
      <div class="section-card">
        <UiInput 
          v-model="form.subject" 
          :label="t('faktury.emailSubject')" 
          required 
          placeholder="Enter subject..."
        />
      </div>

      <div class="section-card editor-section">
        <label class="section-label">📝 {{ t('faktury.emailBody') }}</label>
        <div class="modern-editor">
          <textarea 
            v-model="form.body" 
            class="editor-textarea" 
            rows="8"
            :placeholder="t('faktury.emailPlaceholder')"
          ></textarea>
          
          <div class="editor-toolbar">
            <span class="toolbar-hint">{{ t('faktury.placeholdersHint') }}</span>
            <div class="tag-cloud">
              <button class="ph-tag" @click="addPlaceholder('{{studentName}}')">
                👤 studentName
              </button>
              <button class="ph-tag" @click="addPlaceholder('{{invoiceNumber}}')">
                📄 invoiceNumber
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="info-note">
        <span class="note-icon">📎</span>
        <span class="note-text">{{ t('faktury.emailNote') }}</span>
      </div>
    </div>

    <div v-if="error" class="error-toast">{{ error }}</div>

    <div class="modal-footer">
      <UiButton variant="ghost" @click="modal.close">{{ t('common.cancel') }}</UiButton>
      <UiButton 
        variant="primary" 
        :loading="loading" 
        :disabled="!isFormValid || loading" 
        @click="submit"
      >
        🚀 {{ t('common.send') }}
      </UiButton>
    </div>
  </BaseModal>
</template>

<style scoped>
.popup-email-draft { max-width: 620px; padding: 0 !important; overflow: hidden; }

.modal-header { padding: 24px 24px 16px; background: var(--app-card-hi); border-bottom: 1px solid var(--app-border); display: flex; gap: 16px; align-items: flex-start; }
.header-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(59, 130, 246, 0.1); display: flex; align-items: center; justify-content: center; font-size: 20px; }
.popup-title { font-size: 18px; font-weight: 800; color: var(--app-text-main); margin: 0; }
.popup-sub { font-size: 13px; color: var(--app-text-dim); margin: 4px 0 0; }

.scroll-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }

.section-card { padding: 16px; background: var(--app-card); border: 1px solid var(--app-border); border-radius: 16px; }
.section-label { font-size: 11px; font-weight: 800; color: var(--app-primary); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 12px; }

.modern-editor { border: 1px solid var(--app-border); border-radius: 12px; background: var(--app-bg); overflow: hidden; transition: border-color 0.2s; }
.modern-editor:focus-within { border-color: var(--app-primary); }

.editor-textarea { width: 100%; background: transparent; border: none; padding: 16px; color: var(--app-text-main); font-family: inherit; font-size: 14px; line-height: 1.6; resize: vertical; outline: none; min-height: 180px; }

.editor-toolbar { background: var(--app-card-hi); padding: 10px 16px; border-top: 1px solid var(--app-border); display: flex; flex-direction: column; gap: 8px; }
.toolbar-hint { font-size: 10px; font-weight: 700; color: var(--app-text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
.tag-cloud { display: flex; gap: 8px; flex-wrap: wrap; }
.ph-tag { background: rgba(79, 110, 247, 0.1); color: var(--app-primary); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: 'Space Mono', monospace; border: 1px solid rgba(79, 110, 247, 0.2); transition: all 0.2s; cursor: pointer; }
.ph-tag:hover { background: var(--app-primary); color: white; transform: translateY(-1px); }

.info-note { display: flex; gap: 12px; background: var(--app-card-hi); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--app-border); }
.note-icon { font-size: 16px; }
.note-text { font-size: 12px; color: var(--app-text-dim); line-height: 1.5; }

.error-toast { margin: 0 24px 16px; padding: 10px 16px; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 10px; color: #f43f5e; font-size: 12px; font-weight: 600; }

.modal-footer { padding: 16px 24px 24px; background: var(--app-card-hi); border-top: 1px solid var(--app-border); display: flex; justify-content: flex-end; gap: 12px; }
</style>
