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
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 18px;
  padding: 18px 22px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--app-shadow);
}

.sum-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  opacity: .5;
}

.c-subscription::after { background: var(--blue); }
.c-replacement::after { background: var(--blue); }
.c-meetings::after { background: var(--purple); }
.c-individual::after { background: var(--pink); }
.c-olympiad::after { background: var(--blue); }
.c-admin::after { background: var(--green); }
.c-bonus::after { background: var(--green); }
.c-trial::after { background: var(--cyan); }
.c-rezygnacje::after { background: var(--red); }

.sum-label { font-size: 10px; font-weight: 800; color: var(--app-text-dim); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 6px; }
.sum-val { font-size: 19px; font-weight: 800; color: var(--app-text-main); }
.sum-sub { font-size: 11px; color: var(--app-text-dim); margin-top: 4px; }

.sum-card-total {
  background: linear-gradient(135deg, var(--status-info-bg), rgba(139,92,246,.15));
  border-color: var(--blue);
  box-shadow: var(--app-shadow);
}
.sum-card-total::after { background: linear-gradient(90deg, var(--blue), var(--purple)); opacity: 1; }
.sum-card-total .sum-val { color: var(--app-text-main); text-shadow: var(--app-glow); }

.mono { font-family: 'Space Mono', monospace; }
</style>
