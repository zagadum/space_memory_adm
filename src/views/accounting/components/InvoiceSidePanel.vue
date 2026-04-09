<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UiButton from '../../../components/ui/UiButton.vue'
import UiBadge from '../../../components/ui/UiBadge.vue'
import UiCard from '../../../components/ui/UiCard.vue'
import { invoicesApi } from '../../../api/invoices.api'
import { useModalStore } from '../../../stores/modal.store'

const props = defineProps<{
  invoice: any | null
  auditLogs: any[]
}>()

const emit = defineEmits<{
  close: []
  refresh: []
  convert: [id: number]
  correct: [invoice: any]
  sendToKsef: [id: number]
  select: [id: number]
}>()

const { t } = useI18n()
const modal = useModalStore()
const activeTab = ref<'info' | 'logs'>('info')
const isPaying = ref(false)

const tabs = computed(() => [
  { key: 'info' as const, icon: '📄', label: t('common.details') },
  { key: 'logs' as const, icon: '🕒', label: t('common.history') },
])

watch(() => props.invoice, (newVal) => {
  if (newVal) activeTab.value = 'info'
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString()
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: currency || 'PLN' }).format(amount)
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'paid': return 'success'
    case 'cancelled': return 'danger'
    case 'draft': return 'warning'
    case 'wystawiona':
    case 'sent': return 'info'
    case 'sending':
    case 'pending': return 'warning'
    case 'error': return 'danger'
    default: return 'neutral'
  }
}

const formatAction = (action: string) => {
  const map: Record<string, string> = {
    'created': t('faktury.auditActions.created'),
    'edited': t('faktury.auditActions.edited'),
    'sent_to_ksef': t('faktury.auditActions.sent_to_ksef'),
    'ksef_accepted': t('faktury.auditActions.ksef_accepted'),
    'ksef_rejected': t('faktury.auditActions.ksef_rejected'),
    'converted_to_fa': t('faktury.auditActions.converted_to_fa'),
    'correction_created': t('faktury.auditActions.correction_created'),
    'email_sent': t('faktury.auditActions.email_sent')
  }
  return map[action] || action
}

const downloadPdf = () => {
  if (!props.invoice) return
  const url = invoicesApi.getPdfUrl(props.invoice.id)
  window.open(url, '_blank')
}

const handleCorrect = () => {
  modal.open('invoice-correct', { invoice: props.invoice })
}

const handleSendEmail = () => {
  if (!props.invoice) return
  modal.open('invoice-email', { invoice: props.invoice })
}

const handleMarkAsPaid = async () => {
  if (!props.invoice) return
  const date = new Date().toISOString().split('T')[0]
  if (!confirm(t('faktury.markAsPaidConfirm'))) return
  
  isPaying.value = true
  try {
    await invoicesApi.bulkPay([props.invoice.id], date)
    emit('refresh')
  } finally {
    isPaying.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="side-panel-overlay" :class="{ active: !!invoice }" @click="$emit('close')" />
    <aside class="side-panel" :class="{ open: !!invoice }">
      <template v-if="invoice">
        <!-- Panel Header -->
        <div class="panel-header">
          <div class="header-top">
            <div class="title-section">
              <div class="icon-box">
                <span class="emoji-large">📄</span>
              </div>
              <div class="title-info">
                <h2 class="invoice-number">{{ invoice.number }}</h2>
                <div class="invoice-meta">
                  <UiBadge variant="neutral" size="sm">{{ invoice.document_type }}</UiBadge>
                  <span class="dot">·</span>
                  <span class="issue-date">{{ formatDate(invoice.issue_date) }}</span>
                  <span class="dot">·</span>
                  <span class="project-name">{{ invoice.project?.name }}</span>
                </div>
              </div>
            </div>
            <button class="close-btn" @click="$emit('close')">✕</button>
          </div>
          
          <div class="quick-actions">
            <UiButton variant="neutral" size="sm" @click="downloadPdf">
              📄 {{ t('faktury.downloadPdf') }}
            </UiButton>
            <UiButton variant="neutral" size="sm" @click="handleSendEmail">
              📧 Email
            </UiButton>
            <UiButton variant="neutral" size="sm" @click="handleCorrect">
              🔧 {{ t('faktury.correct') }}
            </UiButton>
            <UiButton 
              v-if="invoice.document_type === 'PF'" 
              variant="primary" 
              size="sm" 
              @click="emit('convert', invoice.id)"
            >
              🔄 {{ t('faktury.convertToFa') }}
            </UiButton>
          </div>

          <div class="panel-tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.key" 
              class="tab-btn" 
              :class="{ active: activeTab === tab.key }" 
              @click="activeTab = tab.key"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- Panel Body -->
        <div class="panel-body">
          <Transition name="fade" mode="out-in">
            <!-- TAB: INFO -->
            <div v-if="activeTab === 'info'" class="tab-content" key="info">
              <!-- Buyer Info -->
              <div class="section">
                <h3 class="section-title">👤 {{ t('faktury.buyer') }}</h3>
                <UiCard class="data-card">
                  <div class="data-group">
                    <span class="label">{{ t('common.name') }}</span>
                    <span class="value font-semibold">{{ invoice.buyer_name }}</span>
                  </div>
                  <div class="data-group" v-if="invoice.buyer_tax_id">
                    <span class="label">NIP</span>
                    <span class="value mono">{{ invoice.buyer_tax_id }}</span>
                  </div>
                  <div class="data-group">
                    <span class="label">{{ t('common.address') }}</span>
                    <span class="value">📍 {{ invoice.buyer_address }}</span>
                  </div>
                </UiCard>
              </div>

              <!-- Financial Details -->
              <div class="section">
                <h3 class="section-title">💰 {{ t('faktury.amount') }}</h3>
                <UiCard class="data-card platinum">
                  <div class="data-group large">
                    <span class="label">{{ t('common.total') }}</span>
                    <span class="value amount-gross">{{ formatCurrency(invoice.amount_gross, invoice.currency) }}</span>
                  </div>
                  <div class="divider" />
                  <div class="data-group">
                    <span class="label">{{ t('common.netto') }}</span>
                    <span class="value">{{ formatCurrency(invoice.amount_net, invoice.currency) }}</span>
                  </div>
                  <div class="data-group">
                    <span class="label">VAT ({{ invoice.vat_rate }})</span>
                    <span class="value">{{ formatCurrency(invoice.vat_value, invoice.currency) }}</span>
                  </div>
                </UiCard>
              </div>

              <!-- Payment Status -->
              <div class="section">
                <h3 class="section-title">📅 {{ t('faktury.paymentDate') }}</h3>
                <UiCard class="data-card" :class="{ 'bg-emerald-50/50 dark:bg-emerald-500/5': !!invoice.payment_date }">
                  <div class="data-group">
                    <span class="label">{{ t('faktury.status') }}</span>
                    <span class="value">
                      <UiBadge v-if="invoice.payment_date" variant="success">
                        {{ t('faktury.statuses.paid') }}
                      </UiBadge>
                      <UiBadge v-else variant="danger">
                        {{ t('faktury.unpaid') }}
                      </UiBadge>
                    </span>
                  </div>
                  <div class="data-group" v-if="invoice.payment_date">
                    <span class="label">{{ t('faktury.paymentDate') }}</span>
                    <span class="value">🗓️ {{ formatDate(invoice.payment_date) }}</span>
                  </div>
                  <div class="mt-4" v-if="!invoice.payment_date">
                    <UiButton 
                      variant="primary" 
                      class="w-full" 
                      :loading="isPaying"
                      @click="handleMarkAsPaid"
                    >
                      💰 {{ t('faktury.markAsPaid') }}
                    </UiButton>
                  </div>
                </UiCard>
              </div>

              <!-- KSeF Status & History -->
              <div class="section">
                <h3 class="section-title">🛡️ KSeF</h3>
                <UiCard class="data-card" :class="invoice.ksef_status">
                  <div class="data-group">
                    <span class="label">{{ t('faktury.status') }}</span>
                    <span class="value">
                      <UiBadge :variant="getStatusVariant(invoice.ksef_status)">
                        {{ t(`faktury.statuses.${invoice.ksef_status}`) }}
                      </UiBadge>
                    </span>
                  </div>
                  
                  <!-- Document Tree (Corrections/Parents) -->
                  <div v-if="invoice.corrections?.length || invoice.parent" class="doc-relations mt-4">
                    <div v-if="invoice.parent" class="doc-node parent" @click="emit('select', invoice.parent.id)">
                      <div class="node-header">
                        <UiBadge variant="warning" size="sm">ORIGIN</UiBadge>
                        <span class="node-date">{{ formatDate(invoice.parent.issue_date) }}</span>
                      </div>
                      <div class="node-number">{{ invoice.parent.number }}</div>
                    </div>

                    <div v-for="corr in invoice.corrections" :key="corr.id" class="doc-node child" @click="emit('select', corr.id)">
                      <div class="node-header">
                        <UiBadge variant="info" size="sm">FK</UiBadge>
                        <span class="node-date">{{ formatDate(corr.issue_date) }}</span>
                      </div>
                      <div class="node-number">{{ corr.number }}</div>
                    </div>
                  </div>

                  <div class="data-group mt-4 pt-4 border-t border-gray-100 dark:border-gray-800" v-if="invoice.ksef_reference">
                    <span class="label">ID KSeF</span>
                    <span class="value mono text-xs">{{ invoice.ksef_reference }}</span>
                  </div>

                  <div class="mt-4" v-if="['draft', 'error'].includes(invoice.ksef_status)">
                    <UiButton variant="primary" class="w-full" @click="emit('sendToKsef', invoice.id)">
                      🚀 {{ t('faktury.sendToKsef') }}
                    </UiButton>
                  </div>
                </UiCard>
              </div>
            </div>

            <!-- TAB: LOGS -->
            <div v-else class="tab-content" key="logs">
              <div class="audit-timeline">
                <div v-for="log in auditLogs" :key="log.id" class="timeline-step">
                  <div class="step-line" />
                  <div class="step-dot" />
                  <div class="step-content">
                    <div class="step-header">
                      <span class="step-action">{{ formatAction(log.action) }}</span>
                      <span class="step-time">{{ formatDateTime(log.created_at) }}</span>
                    </div>
                    <div class="step-user">
                      👤 {{ log.user?.name || 'System' }}
                    </div>
                    <div class="step-reason" v-if="log.reason">
                      {{ log.reason }}
                    </div>
                  </div>
                </div>
                <div v-if="auditLogs.length === 0" class="empty-logs">
                  {{ t('common.noData') }}
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </template>
    </aside>
  </Teleport>
</template>

<style scoped>
.side-panel-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px); z-index: 1000;
  opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
}
.side-panel-overlay.active { opacity: 1; pointer-events: auto; }

.side-panel {
  position: fixed; top: 0; right: 0; bottom: 0; width: 480px; max-width: 100vw;
  background: var(--app-bg); border-left: 1px solid var(--app-border);
  z-index: 1001; display: flex; flex-direction: column;
  transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
}
.side-panel.open { transform: translateX(0); }

.panel-header {
  padding: 24px 24px 0; background: var(--app-card);
  border-bottom: 1px solid var(--app-border); flex-shrink: 0;
}

.header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.title-section { display: flex; align-items: center; gap: 16px; }
.icon-box {
  width: 48px; height: 48px; border-radius: 12px;
  background: rgba(59, 130, 246, 0.1); display: flex; align-items: center; justify-content: center;
}
.emoji-large { font-size: 28px; }
.invoice-number { font-size: 20px; font-weight: 700; color: var(--app-text-main); margin: 0; font-family: 'Space Mono', monospace; }
.invoice-meta { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--app-text-dim); margin-top: 4px; }
.dot { opacity: 0.5; }

.close-btn {
  padding: 8px; border-radius: 8px; color: var(--app-text-dim);
  transition: all 0.2s; font-size: 18px; line-height: 1;
}
.close-btn:hover { background: var(--app-card-hi); color: var(--app-text-main); }

.quick-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }

.panel-tabs { display: flex; gap: 4px; }
.tab-btn {
  padding: 10px 16px; font-size: 13px; font-weight: 600; color: var(--app-text-dim);
  display: flex; align-items: center; gap: 8px; border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.tab-btn:hover { color: var(--app-text-main); }
.tab-btn.active { color: var(--app-primary); border-bottom-color: var(--app-primary); }

.panel-body { flex: 1; overflow-y: auto; padding: 24px; }
.section { margin-bottom: 24px; }
.section-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--app-text-dim); margin-bottom: 12px;
}

.data-card { padding: 16px; display: flex; flex-direction: column; gap: 12px; border: 1px solid var(--app-border); background: var(--app-card); }
.data-group { display: flex; justify-content: space-between; gap: 12px; }
.label { font-size: 13px; color: var(--app-text-dim); }
.value { font-size: 14px; color: var(--app-text-main); text-align: right; }
.value.mono { font-family: 'Space Mono', monospace; font-size: 12px; }
.amount-gross { font-size: 18px; font-weight: 700; color: var(--app-primary); font-family: 'Outfit', sans-serif; }

.divider { height: 1px; background: var(--app-border); opacity: 0.5; }

/* Document Relations */
.doc-relations { display: flex; flex-direction: column; gap: 8px; padding-left: 12px; border-left: 2px solid var(--app-border); }
.doc-node {
  padding: 8px 12px; background: var(--app-card); border-radius: 8px;
  cursor: pointer; transition: transform 0.2s; border: 1px solid var(--app-border);
}
.doc-node:hover { transform: translateX(4px); border-color: var(--app-primary); }
.node-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
.node-date { font-size: 10px; color: var(--app-text-dim); }
.node-number { font-size: 13px; font-weight: 600; font-family: 'Space Mono', monospace; }

/* Timeline */
.audit-timeline { position: relative; padding-left: 24px; }
.timeline-step { position: relative; padding-bottom: 24px; }
.step-line { position: absolute; left: -16px; top: 12px; bottom: 0; width: 2px; background: var(--app-border); }
.timeline-step:last-child .step-line { display: none; }
.step-dot { position: absolute; left: -21px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: var(--app-primary); border: 2px solid var(--app-bg); }
.step-header { display: flex; justify-content: space-between; margin-bottom: 4px; gap: 8px; }
.step-action { font-size: 13px; font-weight: 600; color: var(--app-text-main); }
.step-time { font-size: 11px; color: var(--app-text-dim); white-space: nowrap; }
.step-user { font-size: 12px; color: var(--app-text-dim); display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.step-reason { font-size: 12px; padding: 6px 10px; background: var(--app-card-hi); border-radius: 6px; border: 1px solid var(--app-border); font-style: italic; }

.empty-logs { padding: 48px; text-align: center; color: var(--app-text-dim); }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
