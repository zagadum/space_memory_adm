<template>
  <div class="stats-header" v-if="stats">
    <div class="stat-card sc-blue">
      <div class="stat-icon">💰</div>
      <div class="stat-info">
        <div class="stat-label">{{ t('faktury.stats.monthlyTurnover') }}</div>
        <div class="stat-value">{{ formatCurrency(stats.gross_total_monthly) }}</div>
        <div class="stat-sub">{{ stats.month }}</div>
      </div>
    </div>

    <div class="stat-card sc-green">
      <div class="stat-icon">✅</div>
      <div class="stat-info">
        <div class="stat-label">{{ t('faktury.stats.paidSum') }}</div>
        <div class="stat-value">{{ formatCurrency(stats.paid_total_monthly) }}</div>
        <div class="stat-sub">{{ paidPercent }}% {{ t('common.total') }}</div>
      </div>
    </div>

    <div class="stat-card sc-amber">
      <div class="stat-icon">⏳</div>
      <div class="stat-info">
        <div class="stat-label">{{ t('faktury.collectionRate') || 'Collection Rate' }}</div>
        <div class="stat-value" :class="getRateColor(invoicesStore.collectionRate)">
          {{ invoicesStore.collectionRate }}%
        </div>
        <div class="stat-sub">{{ t('faktury.paidVsIssued') || 'Paid vs Issued' }}</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-info">
        <div class="stat-label">{{ t('faktury.stats.unpaidCount') }}</div>
        <div class="stat-value">{{ stats.unpaid_count }}</div>
        <div class="stat-sub">{{ t('faktury.stats.needAttention') }}</div>
      </div>
    </div>

    <div class="stat-card sc-red" :class="{ 'sc-green': stats.ksef_error_count === 0 }">
      <div class="stat-icon">{{ stats.ksef_error_count === 0 ? '🛡️' : '⚠️' }}</div>
      <div class="stat-info">
        <div class="stat-label">KSeF Health</div>
        <div class="stat-value">{{ stats.ksef_error_count }}</div>
        <div class="stat-sub">{{ stats.ksef_error_count === 0 ? 'All systems nominal' : t('faktury.stats.errorsDetected') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useInvoicesStore } from '../../../stores/invoices.store';

const props = defineProps<{
  stats: {
    gross_total_monthly: number;
    paid_total_monthly: number;
    unpaid_count: number;
    ksef_error_count: number;
    month: string;
  } | null;
}>();

const { t } = useI18n();
const invoicesStore = useInvoicesStore();

const paidPercent = computed(() => {
  if (!props.stats || props.stats.gross_total_monthly === 0) return 0;
  return Math.round((props.stats.paid_total_monthly / props.stats.gross_total_monthly) * 100);
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(amount || 0);
}

function getRateColor(rate: number) {
  if (rate >= 90) return 'text-success';
  if (rate >= 70) return 'text-warning';
  return 'text-danger';
}
</script>

<style scoped>
.stats-header {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 14px;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.15;
  z-index: 0;
}

.sc-blue::before { background: #4f6ef7; }
.sc-green::before { background: #10b981; }
.sc-amber::before { background: #f59e0b; }
.sc-red::before { background: #ef4444; }

.stat-icon {
  font-size: 28px;
  z-index: 1;
}

.stat-info {
  z-index: 1;
}

.stat-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--app-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--app-text-main);
  font-family: 'Outfit', sans-serif;
}

.stat-sub {
  font-size: 11px;
  color: var(--app-text-dim);
  margin-top: 2px;
}

@media (max-width: 1200px) {
  .stats-header {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-header {
    grid-template-columns: 1fr;
  }
}
</style>
