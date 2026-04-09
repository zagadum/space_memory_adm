<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '../BaseModal.vue'
import UiButton from '../../components/ui/UiButton.vue'
import { useModalStore } from '../../stores/modal.store'
import { useInvoicesStore } from '../../stores/invoices.store'
import { useNotificationStore } from '../../stores/notification.store'
import { invoicesApi } from '../../api/invoices.api'

const { t } = useI18n()
const modal = useModalStore()
const invoicesStore = useInvoicesStore()
const notifications = useNotificationStore()

const invoice = computed(() => modal.payload as any)
const deleting = ref(false)

async function handleDelete() {
  if (!invoice.value?.id) return
  deleting.value = true
  try {
    await invoicesApi.delete(invoice.value.id)
    await invoicesStore.fetchInvoices()
    notifications.addToast(t('faktury.deleteSuccess'), 'success')
    modal.close()
  } catch (err: any) {
    notifications.addToast(err.message || t('common.error'), 'error')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <BaseModal popupClass="popup-invoice-delete">
    <div class="flex flex-col">
      <!-- Header -->
      <div class="flex items-center gap-4 px-6 py-5 border-b border-[var(--app-border)] bg-[var(--app-card-hi)]">
        <div class="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xl flex-shrink-0">
          🗑
        </div>
        <div>
          <h2 class="text-lg font-extrabold text-[var(--app-text-main)] m-0">
            {{ t('faktury.deleteTitle') }}
          </h2>
          <p class="text-xs text-[var(--app-text-dim)] mt-0.5">
            {{ t('faktury.deleteSubtitle') }}
          </p>
        </div>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 flex flex-col gap-4">
        <!-- Invoice summary card -->
        <div class="rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 px-4 py-3">
          <div class="flex items-center justify-between">
            <span class="font-mono text-sm font-bold text-red-600 dark:text-red-400">
              {{ invoice?.number ?? '—' }}
            </span>
            <span class="text-xs font-bold text-[var(--app-text-dim)]">
              {{ invoice?.document_type }}
            </span>
          </div>
          <div class="text-sm font-semibold text-[var(--app-text-main)] mt-1">
            {{ invoice?.buyer_name }}
          </div>
          <div v-if="invoice?.amount_gross" class="font-mono text-xs text-[var(--app-text-dim)] mt-0.5">
            {{ new Intl.NumberFormat('pl-PL', { style: 'currency', currency: invoice?.currency ?? 'PLN' }).format(invoice.amount_gross) }}
          </div>
        </div>

        <!-- Warning message -->
        <div class="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30 px-4 py-3">
          <span class="text-base mt-0.5">⚠️</span>
          <p class="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed m-0">
            {{ t('faktury.deleteWarning') }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 px-6 py-4 bg-[var(--app-card-hi)] border-t border-[var(--app-border)]">
        <UiButton variant="ghost" @click="modal.close">
          {{ t('common.cancel') }}
        </UiButton>
        <UiButton variant="danger" :loading="deleting" @click="handleDelete">
          🗑 {{ t('faktury.confirmDelete') }}
        </UiButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.popup-invoice-delete { max-width: 440px; padding: 0 !important; overflow: hidden; }
</style>
