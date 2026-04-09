<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useInvoicesStore } from '../../../stores/invoices.store'
import UiCard from '../../../components/ui/UiCard.vue'

const { t } = useI18n()
const store = useInvoicesStore()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(amount || 0)
}

const paidPercent = computed(() => {
  if (!store.grossMonthly) return 0
  return Math.round((store.paidMonthly / store.grossMonthly) * 100)
})

const getRateVariant = (rate: number) => {
  if (rate >= 90) return 'text-emerald-500'
  if (rate >= 70) return 'text-amber-500'
  return 'text-rose-500'
}
</script>

<template>
  <div class="stats-grid">
    <!-- Turnover -->
    <UiCard class="stat-card glass platinum">
      <div class="stat-icon-wrapper blue">
        <span class="emoji-icon">💰</span>
      </div>
      <div class="stat-info">
        <span class="stat-label">{{ t('faktury.stats.monthlyTurnover') }}</span>
        <div class="stat-value-row">
          <span class="stat-value highlight">{{ formatCurrency(store.grossMonthly) }}</span>
        </div>
        <span class="stat-sub">{{ store.stats?.month || '-' }}</span>
      </div>
    </UiCard>

    <!-- Paid -->
    <UiCard class="stat-card glass">
      <div class="stat-icon-wrapper emerald">
        <span class="emoji-icon">✅</span>
      </div>
      <div class="stat-info">
        <span class="stat-label">{{ t('faktury.stats.paidSum') }}</span>
        <div class="stat-value-row">
          <span class="stat-value">{{ formatCurrency(store.paidMonthly) }}</span>
          <span class="stat-badge success">{{ paidPercent }}%</span>
        </div>
        <span class="stat-sub">{{ t('common.total') }}</span>
      </div>
    </UiCard>

    <!-- Collection Rate -->
    <UiCard class="stat-card glass">
      <div class="stat-icon-wrapper amber">
        <span class="emoji-icon">📈</span>
      </div>
      <div class="stat-info">
        <span class="stat-label">{{ t('faktury.collectionRate') }}</span>
        <div class="stat-value-row">
          <span class="stat-value" :class="getRateVariant(store.collectionRate)">{{ store.collectionRate }}%</span>
        </div>
        <span class="stat-sub">{{ t('faktury.paidVsIssued') }}</span>
      </div>
    </UiCard>

    <!-- Unpaid -->
    <UiCard class="stat-card glass">
      <div class="stat-icon-wrapper rose">
        <span class="emoji-icon">⏳</span>
      </div>
      <div class="stat-info">
        <span class="stat-label">{{ t('faktury.stats.unpaidCount') }}</span>
        <div class="stat-value-row">
          <span class="stat-value text-rose-500">{{ store.unpaidCount }}</span>
        </div>
        <span class="stat-sub">{{ t('faktury.stats.needAttention') }}</span>
      </div>
    </UiCard>

    <!-- KSeF Health -->
    <UiCard class="stat-card glass health-card" :class="{ 'has-errors': (store.stats?.ksef_error_count || 0) > 0 }">
      <div class="stat-icon-wrapper" :class="(store.stats?.ksef_error_count || 0) === 0 ? 'emerald' : 'rose'">
        <span class="emoji-icon">{{ (store.stats?.ksef_error_count || 0) === 0 ? '🛡️' : '⚠️' }}</span>
      </div>
      <div class="stat-info">
        <span class="stat-label">KSeF Status</span>
        <div class="stat-value-row">
          <span class="stat-value">{{ store.stats?.ksef_error_count || 0 }}</span>
        </div>
        <span class="stat-sub">
          {{ (store.stats?.ksef_error_count || 0) === 0 ? 'All systems nominal' : t('faktury.stats.errorsDetected') }}
        </span>
      </div>
    </UiCard>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--app-border);
  background: var(--app-card);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.emoji-icon {
  font-size: 24px;
}

.stat-icon-wrapper.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.stat-icon-wrapper.emerald { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.stat-icon-wrapper.amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.stat-icon-wrapper.rose { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }

.stat-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--app-text-dim);
  margin-bottom: 2px;
}

.stat-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--app-text-main);
  font-family: 'Outfit', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value.highlight {
  color: var(--app-primary);
}

.stat-sub {
  font-size: 11px;
  color: var(--app-text-dim);
  margin-top: 1px;
}

.stat-badge {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  border: 1px solid transparent;
}

.stat-badge.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.2);
}

.health-card.has-errors {
  border-color: rgba(244, 63, 94, 0.3);
  background: rgba(244, 63, 94, 0.02);
}

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
