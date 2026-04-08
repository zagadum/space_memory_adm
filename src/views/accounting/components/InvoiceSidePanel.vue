<template>
  <Teleport to="body">
    <div class="sp-overlay" :class="{ active: !!invoice }" @click="$emit('close')" />
    <div class="sp-panel" :class="{ open: !!invoice }">
      <template v-if="invoice">
        <!-- HEADER -->
        <div class="sp-header">
          <div class="sp-header-top">
            <div class="sp-title-row">
              <div class="sp-icon">📄</div>
              <div>
                <div class="sp-name">{{ invoice.number }}</div>
                <div class="sp-meta">
                  <span class="doc-type">{{ invoice.document_type }}</span>
                  · {{ formatDate(invoice.issue_date) }}
                  · {{ invoice.project?.name }}
                </div>
              </div>
            </div>
            <div class="sp-close" @click="$emit('close')">✕</div>
          </div>
          
          <div class="sp-action-bar">
            <UiButton variant="ghost" size="sm" @click="downloadPdf">
              📄 {{ t('faktury.downloadPdf') }}
            </UiButton>
            <UiButton variant="amber" block @click="handleCorrect">
              🔧 {{ t('faktury.correct') }}
            </UiButton>
            <UiButton variant="ghost" block @click="handleSendEmail">
              📧 {{ t('faktury.sendEmail') }}
            </UiButton>
            <UiButton 
              v-if="invoice.document_type === 'PF'" 
              variant="primary" 
              size="sm" 
              @click="onConvert"
            >
              🔄 {{ t('faktury.convertToFa') }}
            </UiButton>
          </div>

          <div class="sp-tabs">
            <div 
              v-for="tab in tabs" 
              :key="tab.key" 
              class="sp-tab" 
              :class="{ active: activeTab === tab.key }" 
              @click="activeTab = tab.key"
            >
              {{ tab.icon }} {{ tab.label }}
            </div>
          </div>
        </div>

        <!-- BODY -->
        <div class="sp-body">
          <!-- TAB: INFO -->
          <div v-show="activeTab === 'info'" class="sp-tab-content">
            <div class="sp-section">
              <div class="sp-section-title">{{ t('faktury.buyer') }}</div>
              <div class="info-card">
                <div class="info-row">
                  <span class="info-label">{{ t('common.name') }}</span>
                  <span class="info-value">{{ invoice.buyer_name }}</span>
                </div>
                <div class="info-row" v-if="invoice.buyer_tax_id">
                  <span class="info-label">NIP</span>
                  <span class="info-value">{{ invoice.buyer_tax_id }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">{{ t('common.address') }}</span>
                  <span class="info-value">{{ invoice.buyer_address }}</span>
                </div>
              </div>
            </div>

            <div class="sp-section">
              <div class="sp-section-title">{{ t('faktury.amount') }}</div>
              <div class="info-card highlight">
                <div class="info-row large">
                  <span class="info-label">{{ t('common.total') }}</span>
                  <span class="info-value">{{ formatCurrency(invoice.amount_gross, invoice.currency) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">{{ t('common.netto') }}</span>
                  <span class="info-value">{{ formatCurrency(invoice.amount_net, invoice.currency) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">VAT ({{ invoice.vat_rate }})</span>
                  <span class="info-value">{{ formatCurrency(invoice.vat_value, invoice.currency) }}</span>
                </div>
              </div>
            </div>

            <div class="sp-section">
              <div class="sp-section-title">{{ t('faktury.paymentDate') || 'Payment Status' }}</div>
              <div class="info-card" :class="{ 'highlight-success': !!invoice.payment_date }">
                <div class="info-row">
                  <span class="info-label">{{ t('faktury.status') }}</span>
                  <span class="info-value">
                    <UiBadge v-if="invoice.payment_date" variant="success">
                      {{ t('faktury.statuses.paid') }}
                    </UiBadge>
                    <UiBadge v-else variant="danger">
                      {{ t('faktury.unpaid') || 'Unpaid' }}
                    </UiBadge>
                  </span>
                </div>
                <div class="info-row border-top pt-2" v-if="invoice.payment_date">
                  <span class="info-label">{{ t('faktury.paymentDate') }}</span>
                  <span class="info-value">{{ formatDate(invoice.payment_date) }}</span>
                </div>
                <div class="mt-2" v-if="!invoice.payment_date">
                  <UiButton 
                    variant="primary" 
                    size="sm" 
                    class="full-width" 
                    :loading="isPaying"
                    @click="handleMarkAsPaid"
                  >
                    💰 {{ t('faktury.markAsPaid') }}
                  </UiButton>
                </div>
              </div>
            </div>

            <div class="sp-section">
              <div class="sp-section-title">KSeF</div>
              <div class="info-card" :class="invoice.ksef_status">
                <div class="info-item">
                  <div class="info-label">{{ t('faktury.status') }}</div>
                  <div class="info-value">
                    <UiBadge :variant="getStatusVariant(invoice.ksef_status)">{{ t(`faktury.statuses.${invoice.ksef_status}`) }}</UiBadge>
                  </div>
                </div>

                <div v-if="invoice.corrections?.length || invoice.parent" class="history-list">
                  <!-- Parent Link -->
                  <div v-if="invoice.parent" class="history-item parent" @click="emit('select', invoice.parent.id)">
                    <div class="item-header">
                      <UiBadge variant="warning" size="sm">FK (Orig)</UiBadge>
                      <span class="item-date">{{ formatDate(invoice.parent.issue_date) }}</span>
                    </div>
                    <div class="item-number">{{ invoice.parent.number }}</div>
                    <div class="item-link">← {{ t('faktury.relation.parent') || 'Original Invoice' }}</div>
                  </div>

                  <!-- Corrections (Children) -->
                  <div 
                    v-for="corr in invoice.corrections" 
                    :key="corr.id" 
                    class="history-item child" 
                    @click="emit('select', corr.id)"
                  >
                    <div class="item-header">
                      <UiBadge variant="info" size="sm">FK</UiBadge>
                      <span class="item-date">{{ formatDate(corr.issue_date) }}</span>
                    </div>
                    <div class="item-number">{{ corr.number }}</div>
                    <div class="item-link">→ {{ t('faktury.relation.child') || 'Correction' }}</div>
                  </div>
                </div>

                <div class="info-row" v-if="invoice.ksef_reference">
                  <span class="info-label">ID KSeF</span>
                  <span class="info-value mono">{{ invoice.ksef_reference }}</span>
                </div>
                <div class="ksef-actions" v-if="['draft', 'error'].includes(invoice.ksef_status)">
                  <UiButton variant="primary" size="sm" class="full-width" @click="sendToKsef">
                    🚀 {{ t('faktury.sendToKsef') }}
                  </UiButton>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB: LOGS -->
          <div v-show="activeTab === 'logs'" class="sp-tab-content">
            <div class="timeline">
              <div v-for="log in auditLogs" :key="log.id" class="timeline-item">
                <div class="timeline-dot" />
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-action">{{ formatAction(log.action) }}</span>
                    <span class="timeline-time">{{ formatDateTime(log.created_at) }}</span>
                  </div>
                  <div class="timeline-user">
                    👤 {{ log.user?.name || 'System' }}
                  </div>
                  <div class="timeline-reason" v-if="log.reason">
                    💬 {{ log.reason }}
                  </div>
                </div>
              </div>
              <div v-if="auditLogs.length === 0" class="empty-logs">
                {{ t('common.noData') }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import UiButton from '../../../components/ui/UiButton.vue';
import UiBadge from '../../../components/ui/UiBadge.vue';
import { invoicesApi } from '../../../api/invoices.api';
import { useModalStore } from '../../../stores/modal.store';

const props = defineProps<{
  invoice: any | null;
  auditLogs: any[];
}>();

const isPaying = ref(false);

const emit = defineEmits<{
  close: [];
  refresh: [];
  convert: [id: number];
  correct: [invoice: any];
  sendToKsef: [id: number];
  select: [id: number];
}>();

const { t } = useI18n();
const modal = useModalStore();
const activeTab = ref<'info' | 'logs'>('info');

const tabs = computed(() => [
  { key: 'info' as const, icon: 'ℹ️', label: t('common.details') || 'Details' },
  { key: 'logs' as const, icon: '📋', label: t('common.history') || 'History' },
]);

watch(() => props.invoice, (newVal) => {
  if (newVal) {
    activeTab.value = 'info';
  }
});

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString();
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: currency || 'PLN' }).format(amount);
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'paid': return 'success';
    case 'cancelled': return 'danger';
    case 'draft': return 'warning';
    case 'wystawiona':
    case 'sent': return 'info';
    case 'sending':
    case 'pending': return 'warning';
    case 'error': return 'danger';
    default: return 'default';
  }
}

function formatAction(action: string) {
  const map: Record<string, string> = {
    'created': t('faktury.actions.created') || 'Документ создан',
    'edited': t('faktury.actions.edited') || 'Изменения внесены',
    'sent_to_ksef': t('faktury.actions.sent_to_ksef') || 'Отправлено в KSeF',
    'ksef_accepted': t('faktury.actions.ksef_accepted') || 'Принято KSeF',
    'ksef_rejected': t('faktury.actions.ksef_rejected') || 'Отклонено KSeF',
    'converted_to_fa': t('faktury.actions.converted_to_fa') || 'Конвертировано в FA',
    'correction_created': t('faktury.actions.correction_created') || 'Создана корректировка',
    'email_sent': t('faktury.actions.email_sent') || 'Email отправлен'
  };
  return map[action] || action;
}

function downloadPdf() {
  if (!props.invoice) return;
  const url = invoicesApi.getPdfUrl(props.invoice.id);
  window.open(url, '_blank');
}

async function handleCorrect() {
  modal.open('invoice-correct', { invoice: props.invoice });
}

async function handleSendEmail() {
  if (!props.invoice) return;
  modal.open('invoice-email', { invoice: props.invoice });
}

function onConvert() {
  if (props.invoice) emit('convert', props.invoice.id);
}

function onCorrect() {
  if (props.invoice) emit('correct', props.invoice);
}

function sendToKsef() {
  if (props.invoice) emit('sendToKsef', props.invoice.id);
}

async function handleMarkAsPaid() {
  if (!props.invoice) return;
  const date = new Date().toISOString().split('T')[0];
  if (!confirm(t('faktury.markAsPaidConfirm') || 'Mark as paid today?')) return;
  
  isPaying.value = true;
  try {
    await invoicesApi.bulkPay([props.invoice.id], date);
    emit('refresh');
  } finally {
    isPaying.value = false;
  }
}
</script>

<style scoped>
.sp-overlay {
  position: fixed; inset: 0; background: rgba(4,4,15,0.4);
  backdrop-filter: blur(4px); z-index: 300;
  opacity: 0; pointer-events: none; transition: opacity 0.3s;
}
.sp-overlay.active { opacity: 1; pointer-events: all; }

.sp-panel {
  position: fixed; top: 0; right: 0; bottom: 0; width: 500px; max-width: 100vw;
  background: var(--app-bg); border-left: 1px solid var(--app-border-hi);
  z-index: 400; display: flex; flex-direction: column;
  transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
}
.sp-panel.open { transform: translateX(0); box-shadow: -10px 0 30px rgba(0,0,0,0.1); }

.sp-header {
  padding: 24px 24px 0; border-bottom: 1px solid var(--app-border); flex-shrink: 0;
  background: var(--app-surface);
}
.sp-header-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.sp-title-row { display: flex; align-items: center; gap: 14px; }
.sp-icon { font-size: 32px; flex-shrink: 0; }
.sp-name { font-size: 18px; font-weight: 700; color: var(--app-text-main); }
.sp-meta { font-size: 13px; color: var(--app-text-dim); margin-top: 4px; }
.doc-type { font-weight: 700; color: var(--app-primary); }

.sp-close {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; cursor: pointer; color: var(--app-text-dim); transition: all 0.2s;
}
.sp-close:hover { background: var(--app-card); color: var(--app-primary); }

.sp-action-bar { display: flex; gap: 8px; margin-bottom: 20px; }

.sp-tabs { display: flex; border-bottom: 1px solid transparent; }
.sp-tab {
  padding: 10px 16px; font-size: 13px; font-weight: 600; color: var(--app-text-dim);
  cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s;
  margin-bottom: -1px;
}
.sp-tab:hover { color: var(--app-text-main); }
.sp-tab.active { color: var(--app-primary); border-bottom-color: var(--app-primary); }

.sp-body { flex: 1; overflow-y: auto; padding: 24px; }
.sp-section { margin-bottom: 24px; }
.sp-section-title {
  font-size: 11px; font-weight: 700; color: var(--app-text-dim);
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;
}

.info-card {
  background: var(--app-card); border: 1px solid var(--app-border);
  border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px;
}
.info-card.highlight { background: rgba(79, 110, 247, 0.03); border-color: rgba(79, 110, 247, 0.2); }
.info-card.error { border-color: var(--app-danger); background: rgba(239, 68, 68, 0.03); }

.info-row { display: flex; justify-content: space-between; gap: 12px; }
.info-row.large { margin-bottom: 8px; border-bottom: 1px solid var(--app-border); padding-bottom: 8px; }
.info-label { font-size: 13px; color: var(--app-text-dim); }
.info-value { font-size: 14px; color: var(--app-text-main); font-weight: 500; text-align: right; }
.info-row.large .info-value { font-size: 18px; font-weight: 700; color: var(--app-primary); }
.mono { font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: -0.02em; }

.ksef-actions { margin-top: 8px; }
.full-width { width: 100%; }

/* History List */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.history-item {
  padding: 12px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}

.history-item:hover {
  transform: translateX(4px);
  border-color: var(--app-primary);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.item-date {
  font-size: 11px;
  color: var(--app-text-dim);
}

.item-number {
  font-weight: 600;
  font-size: 14px;
  color: var(--app-text-main);
}

.item-link {
  font-size: 12px;
  color: var(--app-primary);
  margin-top: 4px;
}

/* Timeline */
.timeline { display: flex; flex-direction: column; gap: 0; border-left: 1px solid var(--app-border); margin-left: 10px; padding-left: 20px; }
.timeline-item { position: relative; padding-bottom: 24px; }
.timeline-dot {
  position: absolute; left: -25.5px; top: 4px;
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--app-primary); border: 2px solid var(--app-bg);
}
.timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.timeline-action { font-size: 13px; font-weight: 600; color: var(--app-text-main); }
.timeline-time { font-size: 11px; color: var(--app-text-dim); }
.timeline-user { font-size: 12px; color: var(--app-text-dim); margin-bottom: 4px; }
.timeline-reason { font-size: 12px; font-style: italic; color: var(--app-text-dim); background: var(--app-card); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--app-border); }

.empty-logs { text-align: center; color: var(--app-text-dim); padding: 40px 0; font-size: 13px; }
</style>
