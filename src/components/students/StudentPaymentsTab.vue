<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStudentPaymentsStore } from '../../stores/studentPayments.store';
import UiButton from '../ui/UiButton.vue';
import UiBadge from '../ui/UiBadge.vue';

const { t } = useI18n();
const paymentsStore = useStudentPaymentsStore();

const formatCurrency = (val: number) => {
  return val.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł';
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'paid': return 'success';
    case 'pending': return 'warning';
    case 'overpayment': return 'info';
    case 'cancelled': return 'default';
    default: return 'default';
  }
};

const handleStart = async () => {
  await paymentsStore.generatePayments();
};

const handleDownload = (id: string) => {
  paymentsStore.downloadInvoice(id);
};
</script>

<template>
  <div class="payments-tab">
    <!-- Top Control Panel -->
    <div class="control-panel">
      <div class="status-box">
        <span class="label">{{ t('studentPayments.status') }}:</span>
        <UiBadge :variant="paymentsStore.subscriptionStatus === 'active' ? 'success' : 'warning'" size="md">
          {{ t(`studentPayments.subscriptionStatus.${paymentsStore.subscriptionStatus}`) }}
        </UiBadge>
      </div>
      
      <div class="actions">
        <UiButton v-if="paymentsStore.subscriptionStatus === 'inactive'" variant="primary" @click="handleStart" :loading="paymentsStore.isLoading">
          {{ t('studentPayments.startSubscription') }}
        </UiButton>

        <template v-else>
          <UiButton v-if="paymentsStore.subscriptionStatus === 'active'" variant="amber" size="sm" @click="paymentsStore.pauseSubscription" :loading="paymentsStore.isLoading">
            ⏸ {{ t('studentPayments.actions.pause') }}
          </UiButton>
          
          <UiButton v-if="paymentsStore.subscriptionStatus === 'paused'" variant="primary" size="sm" @click="paymentsStore.resumeSubscription" :loading="paymentsStore.isLoading">
            ▶ {{ t('studentPayments.actions.resume') }}
          </UiButton>

          <UiButton 
            variant="ghost" 
            size="sm" 
            class="btn-cancel" 
            @click="paymentsStore.cancelSubscription"
            :loading="paymentsStore.isLoading"
          >
            🚫 {{ t('studentPayments.actions.cancel') }}
          </UiButton>
        </template>
        
        <div class="discount-selector">
          <UiButton variant="ghost" @click="console.log('Open discount selector')">
            + {{ t('studentPayments.addDiscount') }}
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Active Discounts -->
    <div class="discounts-section" v-if="paymentsStore.activeDiscounts.length">
      <h3>{{ t('studentPayments.activeDiscounts') }}</h3>
      <div class="discount-list">
        <div v-for="d in paymentsStore.activeDiscounts" :key="d.id" class="discount-tag">
          <span class="icon">🏷️</span>
          {{ d.label }}
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="transactions-section">
      <h3>{{ t('studentPayments.transactions.title') }}</h3>
      
      <div class="table-container">
        <table class="finance-table">
          <thead>
            <tr>
              <th>{{ t('studentPayments.transactions.month') }}</th>
              <th>{{ t('studentPayments.transactions.basePrice') }}</th>
              <th>{{ t('studentPayments.transactions.discount') }}</th>
              <th>{{ t('studentPayments.transactions.total') }}</th>
              <th>{{ t('studentPayments.transactions.status') }}</th>
              <th>{{ t('studentPayments.transactions.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tr in paymentsStore.transactions" :key="tr.id">
              <td class="cell-month">{{ tr.month }}</td>
              <td class="cell-amount mono">{{ formatCurrency(tr.amount) }}</td>
              <td class="cell-discount mono" :class="{ 'has-discount': tr.discount > 0 }">
                {{ tr.discount > 0 ? '-' + formatCurrency(tr.discount) : '—' }}
              </td>
              <td class="cell-total mono fw-700">{{ formatCurrency(tr.total) }}</td>
              <td>
                <UiBadge :variant="getStatusVariant(tr.status)" size="sm">
                  {{ t(`studentPayments.transactionStatus.${tr.status}`) }}
                </UiBadge>
              </td>
              <td>
                <UiButton variant="ghost" @click="handleDownload(tr.id)">
                  📄 KSeF PDF
                </UiButton>
              </td>
            </tr>
            <tr v-if="paymentsStore.transactions.length === 0">
              <td colspan="6" class="empty-state">
                {{ t('common.loadingData') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payments-tab {
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: #fff;
}

/* Glassmorphism Common */
.control-panel, .discounts-section, .table-container {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
}

/* Control Panel */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.status-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-box .label {
  font-size: 14px;
  color: var(--dim, #8892b0);
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Discounts */
.discounts-section h3, .transactions-section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #fff;
}

.discount-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.discount-tag {
  background: rgba(79, 110, 247, 0.1);
  border: 1px solid rgba(79, 110, 247, 0.2);
  color: var(--blue, #4f6ef7);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Table Styling */
.table-container {
  padding: 0;
  overflow: hidden;
}

.finance-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.finance-table th {
  text-align: left;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.02);
  color: var(--dim, #8892b0);
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.finance-table td {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.finance-table tr:hover td {
  background: rgba(255, 255, 255, 0.01);
}

.mono {
  font-family: 'Space Mono', monospace;
}

.fw-700 {
  font-weight: 700;
}

.has-discount {
  color: var(--green, #10b981);
}

.cell-month {
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 40px !important;
  color: var(--dim, #8892b0);
}

/* Responsive */
@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
