<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '../BaseModal.vue'
import UiButton from '../../components/ui/UiButton.vue'
import { useModalStore } from '../../stores/modal.store'
import { useInvoicesStore } from '../../stores/invoices.store'
import { useNotificationStore } from '../../stores/notification.store'

const { t } = useI18n()
const modal = useModalStore()
const invoicesStore = useInvoicesStore()
const notifications = useNotificationStore()

const invoice = computed(() => modal.payload as any)
const saving = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  buyer_name: '',
  buyer_tax_id: '',
  buyer_address: '',
  amount_gross: 0,
  vat_rate: '23',
  issue_date: '',
  sale_date: '',
  due_date: '',
  payment_method: 'transfer',
  notes: '',
  currency: 'PLN',
})

onMounted(() => {
  if (!invoice.value) return
  form.buyer_name     = invoice.value.buyer_name     ?? ''
  form.buyer_tax_id   = invoice.value.buyer_tax_id   ?? ''
  form.buyer_address  = invoice.value.buyer_address  ?? ''
  form.amount_gross   = invoice.value.amount_gross   ?? 0
  form.vat_rate       = String(invoice.value.vat_rate ?? '23')
  form.issue_date     = invoice.value.issue_date     ?? ''
  form.sale_date      = invoice.value.sale_date      ?? ''
  form.due_date       = invoice.value.due_date       ?? ''
  form.payment_method = invoice.value.payment_method ?? 'transfer'
  form.notes          = invoice.value.notes          ?? ''
  form.currency       = invoice.value.currency       ?? 'PLN'
})

const isValid = computed(() =>
  form.buyer_name.trim() !== '' &&
  form.buyer_address.trim() !== '' &&
  form.amount_gross > 0 &&
  form.issue_date !== ''
)

async function handleSave() {
  if (!invoice.value?.id) return
  saving.value = true
  error.value = null
  try {
    await invoicesStore.updateInvoice(invoice.value.id, { ...form })
    notifications.addToast(t('common.savedSuccessfully'), 'success')
    modal.close()
  } catch (err: any) {
    error.value = err.message || t('common.error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal popupClass="popup-invoice-edit">
    <div class="flex flex-col">
      <!-- Header -->
      <div class="flex items-center gap-4 px-6 py-5 border-b border-[var(--app-border)] bg-[var(--app-card-hi)]">
        <div class="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl flex-shrink-0">
          ✏️
        </div>
        <div class="flex-1">
          <h2 class="text-lg font-extrabold text-[var(--app-text-main)] m-0">
            {{ t('faktury.editTitle') }}
          </h2>
          <p class="text-xs text-[var(--app-text-dim)] mt-0.5 font-mono">
            {{ invoice?.number ?? '—' }}
          </p>
        </div>
        <button class="text-[var(--app-text-dim)] hover:text-[var(--app-text-main)] text-lg leading-none" @click="modal.close">✕</button>
      </div>

      <!-- Scroll body -->
      <div class="px-6 py-5 max-h-[62vh] overflow-y-auto flex flex-col gap-4">

        <!-- Buyer -->
        <div class="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4">
          <p class="text-[10px] font-extrabold uppercase tracking-widest text-[var(--app-primary)] mb-3">
            {{ t('faktury.buyerDetails') }}
          </p>
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2 flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-[var(--app-text-dim)]">{{ t('common.name') }} *</label>
              <input
                v-model="form.buyer_name"
                class="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-[9px] px-3 py-2 text-sm text-[var(--app-text-main)] outline-none focus:border-[var(--app-primary)]"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-[var(--app-text-dim)]">{{ $t('faktury.nip') }}</label>
              <input
                v-model="form.buyer_tax_id"
                class="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-[9px] px-3 py-2 text-sm font-mono text-[var(--app-text-main)] outline-none focus:border-[var(--app-primary)]"
                placeholder="0000000000"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-[var(--app-text-dim)]">{{ $t('faktury.modals.settings.defaultCurrency') }}</label>
              <select
                v-model="form.currency"
                class="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-[9px] px-3 py-2 text-sm text-[var(--app-text-main)] outline-none cursor-pointer"
              >
                <option value="PLN">PLN — {{ $t('common.currencies.pln') }}</option>
                <option value="EUR">EUR — {{ $t('common.currencies.eur') }}</option>
                <option value="USD">USD — {{ $t('common.currencies.usd') }}</option>
                <option value="UAH">UAH — {{ $t('common.currencies.uah') }}</option>
              </select>
            </div>
            <div class="col-span-2 flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-[var(--app-text-dim)]">{{ t('common.address') }} *</label>
              <input
                v-model="form.buyer_address"
                class="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-[9px] px-3 py-2 text-sm text-[var(--app-text-main)] outline-none focus:border-[var(--app-primary)]"
              />
            </div>
          </div>
        </div>

        <!-- Financial Details -->
        <div class="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4">
          <p class="text-[10px] font-extrabold uppercase tracking-widest text-[var(--app-primary)] mb-3">
            {{ t('faktury.documentParams') }}
          </p>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-[var(--app-text-dim)]">{{ $t('faktury.amount') }} ({{ $t('faktury.brutto') }}) *</label>
              <input
                v-model.number="form.amount_gross"
                type="number"
                step="0.01"
                min="0"
                class="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-[9px] px-3 py-2 text-sm font-mono font-bold text-[var(--app-primary)] outline-none focus:border-[var(--app-primary)]"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-[var(--app-text-dim)]">{{ t('faktury.vatRate') }}</label>
              <select
                v-model="form.vat_rate"
                class="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-[9px] px-3 py-2 text-sm text-[var(--app-text-main)] outline-none cursor-pointer"
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="8">8%</option>
                <option value="23">23%</option>
                <option value="zw">{{ $t('faktury.modals.settings.vatExempt') }}</option>
                <option value="np">{{ $t('faktury.modals.settings.vatNp') }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-[var(--app-text-dim)]">{{ t('faktury.date') }} *</label>
              <input
                v-model="form.issue_date"
                type="date"
                class="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-[9px] px-3 py-2 text-xs font-mono text-[var(--app-text-main)] outline-none focus:border-[var(--app-primary)]"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-[var(--app-text-dim)]">{{ t('faktury.saleDate') }}</label>
              <input
                v-model="form.sale_date"
                type="date"
                class="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-[9px] px-3 py-2 text-xs font-mono text-[var(--app-text-main)] outline-none focus:border-[var(--app-primary)]"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-[var(--app-text-dim)]">{{ t('faktury.dueDate') }}</label>
              <input
                v-model="form.due_date"
                type="date"
                class="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-[9px] px-3 py-2 text-xs font-mono text-[var(--app-text-main)] outline-none focus:border-[var(--app-primary)]"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-[var(--app-text-dim)]">{{ t('faktury.paymentMethod') }}</label>
              <select
                v-model="form.payment_method"
                class="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-[9px] px-3 py-2 text-sm text-[var(--app-text-main)] outline-none cursor-pointer"
              >
                <option value="transfer">{{ $t('faktury.modals.settings.paymentMethods.transfer') }}</option>
                <option value="card">{{ $t('faktury.modals.settings.paymentMethods.card') }}</option>
                <option value="cash">{{ $t('faktury.modals.settings.paymentMethods.cash') }}</option>
                <option value="imoje">{{ $t('faktury.modals.settings.paymentMethods.imoje') }}</option>
              </select>
            </div>
            <div class="col-span-2 flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-[var(--app-text-dim)]">{{ t('common.notes') }}</label>
              <textarea
                v-model="form.notes"
                rows="2"
                style="resize: vertical;"
                class="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-[9px] px-3 py-2 text-sm text-[var(--app-text-main)] outline-none focus:border-[var(--app-primary)]"
              />
            </div>
          </div>
        </div>

        <!-- KSeF warning if invoice was already sent -->
        <div
          v-if="invoice?.ksef_reference"
          class="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30 px-4 py-3"
        >
          <span class="text-base mt-0.5">⚠️</span>
          <p class="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed m-0">
            {{ t('modals.invoice.ksefWarning') }}
          </p>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="mx-6 mb-3 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 font-semibold">
        {{ error }}
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 px-6 py-4 bg-[var(--app-card-hi)] border-t border-[var(--app-border)]">
        <UiButton variant="ghost" @click="modal.close">{{ t('common.cancel') }}</UiButton>
        <UiButton variant="primary" :loading="saving" :disabled="!isValid || saving" @click="handleSave">
          💾 {{ t('common.save') }}
        </UiButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.popup-invoice-edit { max-width: 560px; padding: 0 !important; overflow: hidden; }
</style>
