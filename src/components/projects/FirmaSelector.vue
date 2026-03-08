<template>
  <div class="firma-selector">
    <div 
      v-for="company in companiesStore.companies" 
      :key="company.id"
      class="firma-opt"
      :class="{ sel: modelValue === company.id }"
      @click="$emit('update:modelValue', company.id)"
    >
      <div class="fo-radio">
        <div class="fo-dot"></div>
      </div>
      <div class="fo-body">
        <div class="fo-name">
          {{ company.name }}
          <span v-if="company.isDefault" class="default-badge">⭐ {{ t('projects.firma.default') || 'DOMYŚLNA' }}</span>
        </div>
        <div class="fo-meta">
          NIP: {{ company.nip }} 
          <span v-if="company.krs">· KRS: {{ company.krs }}</span> 
          <span v-if="company.regon">· REGON: {{ company.regon }}</span>
        </div>
        <div class="fo-meta" style="margin-top:2px;">{{ company.address }} · {{ company.email }}</div>
        <div class="fo-tags" style="margin-top:5px;">
          <span v-for="tag in company.tags" :key="tag" class="badge b-dim" style="font-size:9.5px;">{{ tag }}</span>
        </div>
      </div>
      <div class="fo-check">✓</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useCompaniesStore } from '../../stores/companies.store';

defineProps<{
  modelValue: string;
}>();

defineEmits(['update:modelValue']);

const { t } = useI18n();
const companiesStore = useCompaniesStore();
</script>

<style scoped>
.firma-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}
.firma-opt {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.025);
  border: 1.5px solid var(--b, rgba(100, 120, 255, 0.12));
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.firma-opt:hover {
  border-color: rgba(79, 110, 247, 0.3);
  background: rgba(79, 110, 247, 0.04);
}
.firma-opt.sel {
  border-color: var(--blue);
  background: rgba(79, 110, 247, 0.08);
}
.fo-radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--b);
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.firma-opt.sel .fo-radio {
  border-color: var(--blue);
  background: var(--blue);
}
.fo-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  opacity: 0;
  transition: opacity 0.2s;
}
.firma-opt.sel .fo-dot { opacity: 1; }
.fo-body { flex: 1; min-width: 0; }
.fo-name {
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 3px;
  color: var(--white);
}
.default-badge {
  font-size: 10px;
  color: var(--amber);
  font-weight: 700;
  margin-left: 6px;
}
.fo-meta {
  font-size: 11px;
  color: var(--dim);
  line-height: 1.4;
}
.fo-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.fo-check {
  font-size: 16px;
  color: var(--blue);
  opacity: 0;
  transition: opacity 0.2s;
}
.firma-opt.sel .fo-check { opacity: 1; }

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
}
.b-dim {
  background: rgba(255, 255, 255, 0.06);
  color: var(--dim);
  border: 1px solid var(--b);
}
</style>
