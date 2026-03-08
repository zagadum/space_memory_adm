<template>
  <div class="proj-card" @click="$emit('click')">
    <div class="pc-stripe" :style="{ background: colorGradient }"></div>
    <div class="pc-body">
      <div class="pc-head">
        <div class="pc-ico" :style="{ background: iconBg, borderColor: iconBorder }">
          {{ project.icon }}
        </div>
        <div class="pc-meta">
          <div class="pc-name">{{ project.name }}</div>
          <div class="pc-badges">
            <span :class="['badge', typeBadgeClass]">{{ t(`projects.type.${project.type}`) }}</span>
            <span class="badge b-green" style="font-size:9px;">● {{ t('common.active') || 'Aktywny' }}</span>
          </div>
        </div>
      </div>
      
      <div class="pc-desc">{{ project.description }}</div>
      
      <div class="inv-tag" :style="{ background: tagBg, borderColor: tagBorder }">
        <div>
          <div class="it-lbl">B2C</div>
          <div class="it-val" :style="{ color: mainColor }">{{ project.invoicePatternB2C }}</div>
        </div>
        <div style="text-align:right;">
          <template v-if="project.type === 'recurring'">
            <div class="it-lbl">B2B</div>
            <div class="it-val amber">{{ project.invoicePatternB2B }}</div>
          </template>
          <template v-else>
            <div class="it-lbl">{{ t('projects.card.price') || 'Cena' }}</div>
            <div class="it-val" style="color:var(--green); font-size: 13px;">{{ project.stats.fixedPrice }} zł</div>
          </template>
        </div>
      </div>

      <div class="pc-stats">
        <div class="pcs">
          <div class="pcs-val" :style="{ color: mainColor }">{{ project.stats.studentsCount }}</div>
          <div class="pcs-lbl">{{ t('projects.card.students') }}</div>
        </div>
        <div class="pcs">
          <div class="pcs-val" style="color: var(--green);">{{ project.stats.invoicesCount }}</div>
          <div class="pcs-lbl">{{ t('projects.card.invoices') }}</div>
        </div>
        <div class="pcs">
          <div class="pcs-val">{{ project.type === 'recurring' ? '—' : (project.stats.fixedPrice + ' zł') }}</div>
          <div class="pcs-lbl">{{ project.type === 'recurring' ? t('projects.card.priceFromCard') : t('projects.card.fixedPrice') || 'cena stała' }}</div>
        </div>
      </div>

      <div class="pc-actions">
        <button class="btn btn-ghost btn-sm" @click.stop="$emit('edit', project)">✏ {{ t('common.edit') || 'Edytuj' }}</button>
        <button class="btn btn-sec btn-sm">📄 {{ t('finance.invoices') || 'Faktury' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Project } from '../../types/projects';

const props = defineProps<{
  project: Project;
}>();

defineEmits(['click', 'edit']);

const { t } = useI18n();

const colorMap: Record<string, string> = {
  blue: '#4f6ef7',
  purple: '#8b5cf6',
  amber: '#f59e0b',
  green: '#10b981',
  cyan: '#06b6d4',
  red: '#ef4444',
  pink: '#ec4899'
};

const gradientMap: Record<string, string> = {
  blue: 'linear-gradient(90deg, #4f6ef7, #8b5cf6)',
  purple: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
  amber: 'linear-gradient(90deg, #f59e0b, #f97316)',
  green: 'linear-gradient(90deg, #10b981, #06b6d4)',
  cyan: 'linear-gradient(90deg, #06b6d4, #4f6ef7)',
  red: 'linear-gradient(90deg, #ef4444, #f97316)',
  pink: 'linear-gradient(90deg, #ec4899, #f59e0b)'
};

const mainColor = computed(() => colorMap[props.project.color] || colorMap.blue);
const colorGradient = computed(() => gradientMap[props.project.color] || gradientMap.blue);

const iconBg = computed(() => `${mainColor.value}1F`); // 12% opacity
const iconBorder = computed(() => `${mainColor.value}40`); // 25% opacity

const tagBg = computed(() => `${mainColor.value}0D`); // 5% opacity
const tagBorder = computed(() => `${mainColor.value}26`); // 15% opacity

const typeBadgeClass = computed(() => {
  if (props.project.type === 'recurring') return props.project.color === 'blue' ? 'b-blue' : 'b-purple';
  return 'b-amber';
});
</script>

<style scoped>
.proj-card {
  background: var(--card, rgba(12, 12, 36, 0.98));
  border: 1px solid var(--b, rgba(100, 120, 255, 0.12));
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
}
.proj-card:hover {
  border-color: var(--bh, rgba(120, 140, 255, 0.28));
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}
.pc-stripe {
  height: 5px;
  width: 100%;
  flex-shrink: 0;
}
.pc-body {
  padding: 20px 22px 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.pc-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.pc-ico {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  border: 1px solid var(--b, rgba(100, 120, 255, 0.12));
}
.pc-meta {
  flex: 1;
  min-width: 0;
}
.pc-name {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--white, #e8eeff);
}
.pc-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
}
.b-blue { background: rgba(79, 110, 247, 0.12); color: #4f6ef7; border: 1px solid rgba(79, 110, 247, 0.2); }
.b-amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
.b-green { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
.b-purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.2); }

.pc-desc {
  font-size: 12px;
  color: var(--dim, #8892b0);
  line-height: 1.6;
  margin-bottom: 14px;
  flex: 1;
}

.inv-tag {
  margin-top: auto;
  padding: 10px 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: rgba(79, 110, 247, 0.05);
  border: 1px solid rgba(79, 110, 247, 0.15);
}
.it-lbl {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--dim, #8892b0);
  margin-bottom: 3px;
}
.it-val {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  font-weight: 700;
}
.it-val.amber { color: #f59e0b; }

.pc-stats {
  display: flex;
  border-top: 1px solid var(--b, rgba(100, 120, 255, 0.12));
  margin-top: 16px;
}
.pcs {
  flex: 1;
  padding: 10px 12px;
  text-align: center;
  border-right: 1px solid var(--b, rgba(100, 120, 255, 0.12));
}
.pcs:last-child {
  border-right: none;
}
.pcs-val {
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--white, #e8eeff);
}
.pcs-lbl {
  font-size: 10px;
  color: var(--dim, #8892b0);
  margin-top: 3px;
}

.pc-actions {
  display: flex;
  gap: 6px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--b, rgba(100, 120, 255, 0.12));
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-family: 'Outfit', sans-serif;
  transition: all 0.18s;
  white-space: nowrap;
}
.btn-sec {
  background: rgba(79, 110, 247, 0.1);
  color: #4f6ef7;
  border: 1px solid rgba(79, 110, 247, 0.25);
}
.btn-sec:hover { background: rgba(79, 110, 247, 0.18); }
.btn-ghost {
  background: rgba(255, 255, 255, 0.035);
  color: var(--dim, #8892b0);
  border: 1px solid var(--b, rgba(100, 120, 255, 0.12));
}
.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.07);
  color: var(--white, #e8eeff);
}
.btn-sm {
  padding: 6px 12px;
  font-size: 11.5px;
}
</style>
