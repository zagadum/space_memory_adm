<script setup lang="ts">
const props = defineProps<{
  sections: Array<{
    label: string;
    amount: number;
    type: string;
    subtext: string;
  }>;
  total: number;
}>();

const formatCurrency = (val: number) => {
  return val.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł';
};
</script>

<template>
  <div class="summary-grid">
    <div 
      v-for="sec in sections" 
      :key="sec.type" 
      class="sum-card" 
      :class="'c-' + sec.type"
    >
      <div class="sum-label">{{ $t(sec.label) }}</div>
      <div class="sum-val">{{ formatCurrency(sec.amount) }}</div>
      <div class="sum-sub">{{ sec.subtext }}</div>
    </div>
    <div class="sum-card sum-card-total">
      <div class="sum-label">RAZEM</div>
      <div class="sum-val mono">{{ formatCurrency(total) }}</div>
      <div class="sum-sub">{{ $t('teacherSalary.totalPayout').toLowerCase() }}</div>
    </div>
  </div>
</template>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.sum-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 18px 22px;
  position: relative;
  overflow: hidden;
}

.sum-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  opacity: .5;
}

.c-subscription::after { background: #4f6ef7; }
.c-replacement::after { background: #4f6ef7; }
.c-meetings::after { background: #8b5cf6; }
.c-individual::after { background: #ec4899; }
.c-olympiad::after { background: #4f6ef7; }
.c-admin::after { background: #22c55e; }
.c-bonus::after { background: #22c55e; }
.c-trial::after { background: #06b6d4; }
.c-rezygnacje::after { background: #ef4444; }

.sum-label { font-size: 10px; font-weight: 800; color: #6b7280; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 6px; }
.sum-val { font-size: 19px; font-weight: 800; }
.sum-sub { font-size: 11px; color: #4b5563; margin-top: 4px; }

.sum-card-total {
  background: linear-gradient(135deg, rgba(79,110,247,.15), rgba(139,92,246,.15));
  border-color: rgba(79,110,247,.3);
}
.sum-card-total::after { background: linear-gradient(90deg, #4f6ef7, #8b5cf6); opacity: 1; }
.sum-card-total .sum-val { color: #f0f0ff; text-shadow: 0 0 10px rgba(79, 110, 247, 0.4); }

.mono { font-family: 'Space Mono', monospace; }
</style>
