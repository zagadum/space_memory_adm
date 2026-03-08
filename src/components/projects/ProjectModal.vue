<template>
  <div class="overlay" :class="{ open: isOpen }" @click.self="close">
    <div class="modal modal-wide" v-if="isOpen">
      <!-- STEP BAR -->
      <div class="stepbar">
        <div 
          v-for="stepNum in 3" 
          :key="stepNum" 
          class="sb-item"
          :class="{ 
            'st-done': currentStep > stepNum, 
            'st-active': currentStep === stepNum,
            'st-pending': currentStep < stepNum 
          }"
        >
          <div class="sb-step">
            <div class="sb-num">{{ stepNum }}</div>
            <div class="sb-lbl">{{ t(`projects.modal.step${stepNum}`) }}</div>
          </div>
          <div v-if="stepNum < 3" class="sb-line"></div>
        </div>
      </div>

      <!-- HEADER -->
      <div class="mhdr">
        <div class="mhdr-row">
          <div class="mhdr-left">
            <div class="mhdr-ico">{{ stepIcon }}</div>
            <div>
              <div class="mtitle">{{ t(`projects.modal.step${currentStep}`) }}</div>
              <div class="msub">{{ stepSubTitle }}</div>
            </div>
          </div>
          <div class="mclose" @click="close">✕</div>
        </div>
      </div>

      <!-- BODY -->
      <div class="mbody">
        <Transition name="fade-slide" mode="out-in">
          <!-- STEP 1: BASICS -->
          <div v-if="currentStep === 1" :key="1" class="step-content">
            <div class="sec"><div class="sdot bg-blue"></div>{{ t('projects.modal.basics') }}</div>
            <div class="fg">
              <label>{{ t('projects.modal.name') }} *</label>
              <input v-model="form.name" type="text" :placeholder="t('projects.modal.namePlaceholder')">
            </div>
            <div class="grid2">
              <div class="fg">
                <label>{{ t('projects.modal.code') }} *</label>
                <input 
                  v-model="form.code" 
                  type="text" 
                  :placeholder="t('projects.modal.codePlaceholder')" 
                  maxlength="10"
                  class="mono-input uppercase"
                  @input="form.code = form.code.toUpperCase().replace(/[^A-Z0-9]/g, '')"
                >
                <div class="hint">{{ t('projects.modal.codeHint') }} <span class="mono blue-text">FA/{{ form.code || '???' }}/2026/03/001</span></div>
              </div>
              <div class="fg">
                <label>{{ t('projects.modal.icon') }}</label>
                <select v-model="form.icon">
                  <option v-for="ico in iconOptions" :key="ico" :value="ico">{{ ico }}</option>
                </select>
              </div>
            </div>

            <div class="sec"><div class="sdot bg-purple"></div>{{ t('projects.modal.color') }}</div>
            <div class="colors">
              <div 
                v-for="color in colorOptions" 
                :key="color"
                class="cdot"
                :class="{ sel: form.color === color }"
                :style="{ background: getGradient(color) }"
                @click="form.color = color"
              ></div>
            </div>

            <div class="sec"><div class="sdot bg-amber"></div>{{ t('projects.modal.type') }}</div>
            <div class="type-grid">
              <div 
                class="type-card" 
                :class="{ 'sel-blue': form.type === 'recurring' }" 
                @click="form.type = 'recurring'"
              >
                <div class="tc-top">
                  <div class="tc-icon">🔄</div>
                  <div class="tc-radio"><span v-if="form.type === 'recurring'">✔</span></div>
                </div>
                <div class="tc-name">{{ t('projects.modal.recurring') }}</div>
                <div class="tc-desc">{{ t('projects.modal.recurringDesc') }}</div>
              </div>
              <div 
                class="type-card" 
                :class="{ 'sel-amber': form.type === 'onetime' }" 
                @click="form.type = 'onetime'"
              >
                <div class="tc-top">
                  <div class="tc-icon">1️⃣</div>
                  <div class="tc-radio"><span v-if="form.type === 'onetime'">✔</span></div>
                </div>
                <div class="tc-name">{{ t('projects.modal.onetime') }}</div>
                <div class="tc-desc">{{ t('projects.modal.onetimeDesc') }}</div>
              </div>
            </div>

            <div class="fg">
              <label>{{ t('projects.modal.description') }}</label>
              <textarea v-model="form.description" rows="2"></textarea>
            </div>
          </div>

          <!-- STEP 2: FINANCE -->
          <div v-else-if="currentStep === 2" :key="2" class="step-content">
            <div class="ib" :class="form.type === 'recurring' ? 'ib-blue' : 'ib-amber'">
              <div class="ib-icon">{{ form.type === 'recurring' ? 'ℹ' : '1️⃣' }}</div>
              <div>{{ form.type === 'recurring' ? t('projects.modal.recurringDesc') : t('projects.modal.onetimeDesc') }}</div>
            </div>

            <div class="sec"><div class="sdot" :class="form.type === 'recurring' ? 'bg-blue' : 'bg-amber'"></div>{{ t('projects.modal.finance') }}</div>
            <div class="grid2">
              <div class="fg" v-if="form.type === 'onetime'">
                <label>{{ t('projects.modal.price') }} *</label>
                <input v-model.number="form.price" type="number" class="mono-input-large" placeholder="0.00">
              </div>
              <div class="fg">
                <label>{{ t('projects.modal.vat') }}</label>
                <select v-model="form.vat">
                  <option value="zw">ZW - zwolnienie</option>
                  <option value="23">23%</option>
                  <option value="8">8%</option>
                  <option value="5">5%</option>
                  <option value="0">0%</option>
                </select>
              </div>
              <div class="fg">
                <label>{{ t('projects.modal.pkwiu') }}</label>
                <input v-model="form.pkwiu" type="text" class="mono-input" placeholder="85.59.19.0">
              </div>
            </div>
          </div>

          <!-- STEP 3: COMPANY & PREVIEW -->
          <div v-else-if="currentStep === 3" :key="3" class="step-content">
            <div class="sec"><div class="sdot bg-green"></div>{{ t('projects.modal.company') }}</div>
            <FirmaSelector v-model="form.firmaId" />
            
            <div class="ib ib-blue mini">
              <div class="ib-icon">🧾</div>
              <div>{{ t('projects.modal.companyDesc') }}</div>
            </div>

            <div class="inv-builder">
              <div class="ib-hdr"><div class="sdot bg-blue"></div>{{ t('projects.modal.preview') }}</div>
              <div class="pattern">
                <div class="tok tok-fa">FA</div>
                <div class="tok tok-sep">/</div>
                <div class="tok tok-code">{{ form.code || '???' }}</div>
                <div class="tok tok-sep">/</div>
                <div class="tok tok-yr">2026</div>
                <div class="tok tok-sep">/</div>
                <div class="tok tok-mm">03</div>
                <div class="tok tok-sep">/</div>
                <div class="tok tok-nn">001</div>
              </div>
              <div class="prev-box">
                <div class="prev-num">FA/{{ form.code || '???' }}/2026/03/001</div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- FOOTER -->
      <div class="mfooter">
        <div class="mfooter-left">
          <button class="btn btn-ghost" @click="close">{{ t('projects.modal.cancel') }}</button>
          <button v-if="currentStep > 1" class="btn btn-ghost" @click="currentStep--">‹ {{ t('projects.modal.prev') }}</button>
        </div>
        <div class="mfooter-right">
          <span class="step-lbl">{{ t('projects.modal.step', { current: currentStep, total: 3 }) }}</span>
          <button v-if="currentStep < 3" class="btn btn-primary" @click="currentStep++">{{ t('projects.modal.next') }} ›</button>
          <button v-else class="btn btn-primary" @click="handleCreate" :disabled="!isFormValid">✔ {{ t('projects.modal.create') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FirmaSelector from './FirmaSelector.vue';
import { useProjectsStore } from '../../stores/projects.store';
import { useCompaniesStore } from '../../stores/companies.store';
import { useNotificationStore } from '../../stores/notification.store';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);

const { t } = useI18n();
const projectsStore = useProjectsStore();
const companiesStore = useCompaniesStore();
const notificationStore = useNotificationStore();

const currentStep = ref(1);

const form = reactive({
  name: '',
  code: '',
  icon: '🚀',
  color: 'blue',
  type: 'recurring' as 'recurring' | 'onetime',
  description: '',
  price: 0,
  vat: 'zw',
  pkwiu: '85.59.19.0',
  firmaId: companiesStore.defaultCompany?.id || ''
});

const iconOptions = ['🚀', '🧠', '🏆', '⚡', '📚', '🎯', '⭐', '🌍'];
const colorOptions = ['blue', 'purple', 'amber', 'green', 'cyan', 'red', 'pink'];

const stepIcon = computed(() => {
  if (currentStep.value === 1) return '📦';
  if (currentStep.value === 2) return '💰';
  return '🧾';
});

const stepSubTitle = computed(() => {
  return t(`projects.modal.step${currentStep.value}`); // In a real app, you'd have more specific sub-titles
});

const isFormValid = computed(() => {
  return form.name.length > 0 && form.code.length > 0 && form.firmaId.length > 0;
});

const getGradient = (color: string) => {
  const map: Record<string, string> = {
    blue: 'linear-gradient(135deg,#4f6ef7,#8b5cf6)',
    purple: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
    amber: 'linear-gradient(135deg,#f59e0b,#f97316)',
    green: 'linear-gradient(135deg,#10b981,#06b6d4)',
    cyan: 'linear-gradient(135deg,#06b6d4,#4f6ef7)',
    red: 'linear-gradient(135deg,#ef4444,#f97316)',
    pink: 'linear-gradient(135deg,#ec4899,#f59e0b)'
  };
  return map[color] || map.blue;
};

const close = () => {
  currentStep.value = 1;
  emit('close');
};

const handleCreate = () => {
  projectsStore.addProject({
    name: form.name,
    code: form.code,
    type: form.type,
    status: 'active',
    icon: form.icon,
    color: form.color,
    description: form.description,
    invoicePatternB2C: `FA/${form.code}/RRRR/MM/NNN`,
    invoicePatternB2B: 'FV/B2B/RRRR/MM/NNN',
    firmaId: form.firmaId,
    stats: {
      studentsCount: 0,
      invoicesCount: 0,
      fixedPrice: form.type === 'onetime' ? form.price : null
    }
  });
  
  notificationStore.addToast(`${t('projects.modal.createSuccess') || 'Project created'}: ${form.name}`, 'success');
  
  close();
};

// Reset form on open
watch(() => props.isOpen, (val) => {
  if (val) {
    currentStep.value = 1;
    form.name = '';
    form.code = '';
    form.icon = '🚀';
    form.color = 'blue';
    form.type = 'recurring';
    form.description = '';
    form.price = 0;
    form.firmaId = companiesStore.defaultCompany?.id || '';
  }
});
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(4, 4, 15, 0.7);
  backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
}
.overlay.open {
  opacity: 1;
  pointer-events: all;
}

.modal {
  background: rgba(16, 16, 46, 0.97);
  border: 1px solid rgba(120, 140, 255, 0.2);
  border-radius: 20px;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.75);
  transform: translateY(20px);
  transition: all 0.3s ease;
  font-family: 'Outfit', sans-serif;
}
.overlay.open .modal {
  transform: translateY(0);
}

/* STEP BAR */
.stepbar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 30px 0;
  gap: 0;
}
.sb-item {
  display: flex;
  align-items: center;
  flex: 1;
}
.sb-item:last-child { flex: 0; }
.sb-step {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sb-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  transition: all 0.3s;
}
.sb-lbl {
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  transition: color 0.3s;
}
.sb-line {
  flex: 1;
  height: 2px;
  margin: 0 12px;
  transition: background 0.3s;
}

.st-done .sb-num { background: rgba(16, 185, 129, 0.2); border: 1.5px solid #10b981; color: #10b981; }
.st-done .sb-lbl { color: #10b981; }
.st-done .sb-line { background: #10b981; }

.st-active .sb-num { background: rgba(79, 110, 247, 0.25); border: 1.5px solid #4f6ef7; color: #4f6ef7; box-shadow: 0 0 15px rgba(79, 110, 247, 0.4); }
.st-active .sb-lbl { color: #4f6ef7; }
.st-active .sb-line { background: rgba(100, 120, 255, 0.15); }

.st-pending .sb-num { background: rgba(255, 255, 255, 0.05); border: 1.5px solid rgba(100, 120, 255, 0.15); color: #8892b0; }
.st-pending .sb-lbl { color: #8892b0; }
.st-pending .sb-line { background: rgba(100, 120, 255, 0.15); }

/* MHDR */
.mhdr {
  padding: 16px 24px;
  border-bottom: 1px solid rgba(100, 120, 255, 0.1);
  margin-top: 10px;
}
.mhdr-row { display: flex; align-items: center; justify-content: space-between; }
.mhdr-left { display: flex; align-items: center; gap: 12px; }
.mhdr-ico {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(79, 110, 247, 0.12);
  border: 1px solid rgba(79, 110, 247, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.mtitle { font-size: 17px; font-weight: 900; color: var(--white); }
.msub { font-size: 11.5px; color: var(--dim); margin-top: 3px; }
.mclose {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--dim);
  transition: all 0.2s;
}
.mclose:hover { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

/* MBODY */
.mbody {
  padding: 24px 32px;
  overflow-y: auto;
  flex: 1;
}
.mbody::-webkit-scrollbar { width: 4px; }
.mbody::-webkit-scrollbar-thumb { background: rgba(79, 110, 247, 0.2); border-radius: 2px; }

.sec {
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--dim);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.sdot { width: 6px; height: 6px; border-radius: 50%; }
.bg-blue { background: #4f6ef7; }
.bg-purple { background: #8b5cf6; }
.bg-amber { background: #f59e0b; }
.bg-green { background: #10b981; }

.fg { margin-bottom: 20px; }
.fg label {
  display: block;
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--dim);
  margin-bottom: 8px;
}
.fg input, .fg select, .fg textarea {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 14.5px;
  color: var(--white);
  font-family: 'Outfit', sans-serif;
  outline: none;
  transition: all 0.25s;
  box-sizing: border-box;
}
.fg textarea {
  height: auto;
  padding: 12px 16px;
}
.fg input:focus, .fg select:focus, .fg textarea:focus {
  border-color: rgba(79, 110, 247, 0.4);
  background: rgba(79, 110, 247, 0.06);
  box-shadow: 0 0 0 4px rgba(79, 110, 247, 0.08);
}
.mono-input { font-family: 'Space Mono', monospace !important; font-size: 14px !important; }
.mono-input-large { font-family: 'Space Mono', monospace !important; font-size: 18px !important; font-weight: 700; color: #f59e0b !important; }
.uppercase { text-transform: uppercase; }
.hint { font-size: 10px; color: var(--dim); margin-top: 6px; opacity: 0.8; }
.blue-text { color: #4f6ef7; font-weight: 700; }

.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.colors { display: flex; gap: 12px; margin: 4px 0 20px; }
.cdot {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.25s;
  border: 3px solid transparent;
  position: relative;
}
.cdot:hover { transform: scale(1.1); }
.cdot.sel {
  border-color: #fff;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.type-card {
  padding: 18px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.25s;
}
.type-card:hover { border-color: rgba(79, 110, 247, 0.3); background: rgba(79, 110, 247, 0.03); }
.type-card.sel-blue { border-color: #4f6ef7; background: rgba(79, 110, 247, 0.1); }
.type-card.sel-amber { border-color: #f59e0b; background: rgba(245, 158, 11, 0.08); }
.tc-top { display: flex; justify-content: space-between; margin-bottom: 12px; }
.tc-icon { font-size: 26px; }
.tc-radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #fff;
}
.sel-blue .tc-radio { background: #4f6ef7; border-color: #4f6ef7; }
.sel-amber .tc-radio { background: #f59e0b; border-color: #f59e0b; }
.tc-name { font-size: 15px; font-weight: 800; margin-bottom: 6px; color: var(--white); }
.tc-desc { font-size: 11.5px; color: var(--dim); line-height: 1.6; }

.ib {
  padding: 14px 18px;
  border-radius: 14px;
  font-size: 12.5px;
  display: flex;
  gap: 14px;
  margin-bottom: 24px;
  align-items: flex-start;
  line-height: 1.6;
}
.ib-blue { background: rgba(79, 110, 247, 0.08); border: 1px solid rgba(79, 110, 247, 0.2); color: rgba(180, 200, 255, 0.9); }
.ib-amber { background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); color: rgba(255, 220, 130, 0.9); }
.ib.mini { margin-top: 4px; padding: 10px 14px; font-size: 11.5px; }

.inv-builder {
  background: rgba(79, 110, 247, 0.04);
  border: 1px solid rgba(79, 110, 247, 0.15);
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 24px;
}
.ib-hdr { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--dim); margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
.pattern { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.tok {
  padding: 8px 14px;
  border-radius: 10px;
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  border: 1.5px solid;
}
.tok-fa { background: rgba(79, 110, 247, 0.12); border-color: rgba(79, 110, 247, 0.3); color: #4f6ef7; }
.tok-code { background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.3); color: #10b981; }
.tok-sep { background: rgba(255, 255, 255, 0.04); border-color: rgba(255, 255, 255, 0.08); color: var(--dim); padding: 8px 10px; }
.tok-yr { background: rgba(139, 92, 246, 0.08); border-color: rgba(139, 92, 246, 0.3); color: #8b5cf6; }
.tok-mm { background: rgba(6, 182, 212, 0.08); border-color: rgba(6, 182, 212, 0.3); color: #06b6d4; }
.tok-nn { background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.3); color: #10b981; }

.prev-box {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px 20px;
}
.prev-num { font-family: 'Space Mono', monospace; font-size: 20px; font-weight: 700; color: #4f6ef7; }

/* FOOTER */
.mfooter {
  padding: 20px 32px;
  background: rgba(4, 4, 15, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mfooter-left, .mfooter-right { display: flex; gap: 12px; align-items: center; }
.step-lbl { font-size: 11.5px; color: var(--dim); font-weight: 700; margin-right: 6px; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-family: 'Outfit', sans-serif;
  transition: all 0.25s;
  white-space: nowrap;
}
.btn-primary {
  background: linear-gradient(135deg, #4f6ef7, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 16px rgba(79, 110, 247, 0.3);
}
.btn-primary:hover:not(:disabled) {
  box-shadow: 0 8px 30px rgba(79, 110, 247, 0.5);
  transform: translateY(-2px);
}
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-ghost {
  background: rgba(255, 255, 255, 0.03);
  color: var(--dim);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--white);
  border-color: rgba(255, 255, 255, 0.15);
}

.animate-fade {
  animation: fadeIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
