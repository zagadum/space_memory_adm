<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import UiButton from '../../../components/ui/UiButton.vue';

const props = defineProps<{
  status: string;
  confirmedAt: string | null;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'dispute', text: string): void;
}>();

const { t } = useI18n();
const disputeVisible = ref(false);
const disputeText = ref('');

const handleSendDispute = () => {
    if (!disputeText.value.trim()) return;
    emit('dispute', disputeText.value);
    disputeVisible.value = false;
    disputeText.value = '';
};
</script>

<template>
  <div class="confirm-block">
    <div class="confirm-title">{{ status === 'draft' ? t('teacherSalary.actions.confirm') : t('teacherSalary.status.' + status) }}</div>
    <div v-if="status === 'draft'" class="confirm-sub">Перевірте всі позиції вище. Після підтвердження розрахунок буде передано бухгалтеру для виплати.</div>
    
    <div class="btns-center" v-if="status === 'draft'">
      <UiButton 
        variant="primary" 
        class="premium-btn" 
        @click="emit('confirm')" 
        :loading="isLoading"
      >
        ✓ {{ t('teacherSalary.actions.confirm') }}
      </UiButton>
      <button class="btn-dispute" @click="disputeVisible = !disputeVisible">
        ⚠️ {{ t('teacherSalary.actions.dispute') }}
      </button>
    </div>

    <div class="dispute-area" v-if="disputeVisible && status === 'draft'">
       <div class="dispute-label">{{ t('teacherSalary.actions.disputeLabel') }}</div>
       <textarea class="dispute-input" v-model="disputeText" :placeholder="t('teacherSalary.actions.disputePlaceholder')"></textarea>
       <div class="btns-left">
         <UiButton size="sm" @click="handleSendDispute">{{ t('teacherSalary.actions.sendToAccounting') }}</UiButton>
         <button class="btn-ghost" @click="disputeVisible = false">{{ t('teacherSalary.actions.cancel') }}</button>
       </div>
    </div>

    <!-- Confirmed Stamp -->
    <div class="confirmed-stamp" :class="{ show: status !== 'draft' }">
       <div class="stamp-inner">
         <div class="stamp-check">✅</div>
         <div class="stamp-text">{{ t('teacherSalary.status.confirmed') }}</div>
         <div class="stamp-date mono" v-if="confirmedAt">{{ confirmedAt }}</div>
       </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-block { padding: 40px; background: rgba(15,15,42,.6); border: 1px dashed rgba(79, 110, 247, .2); border-radius: 24px; position: relative; margin-top: 40px; text-align: center; }
.confirm-title { font-size: 22px; font-weight: 800; margin-bottom: 10px; }
.confirm-sub { color: #6b7280; font-size: 13.5px; max-width: 500px; margin: 0 auto 24px; line-height: 1.5; }

.btns-center { display: flex; justify-content: center; gap: 16px; margin-bottom: 24px; }
.premium-btn { background: linear-gradient(135deg, #4f6ef7, #8b5cf6); border: none; padding: 14px 40px; font-weight: 800; border-radius: 14px; box-shadow: 0 0 20px rgba(79,110,247,.4); }
.premium-btn:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(139,92,246,.5); }

.btn-dispute { background: transparent; border: 1px solid rgba(245,158,11,.3); color: #f59e0b; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all .2s; }
.btn-dispute:hover { background: rgba(245,158,11,.07); border-color: #f59e0b; }

.dispute-area { text-align: left; background: rgba(0,0,0,.3); padding: 24px; border-radius: 16px; margin-top: 20px; }
.dispute-label { font-size: 12px; font-weight: 800; color: #f59e0b; margin-bottom: 12px; text-transform: uppercase; }
.dispute-input { width: 100%; height: 100px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; color: #fff; padding: 12px; font-family: inherit; margin-bottom: 16px; resize: none; }

.btns-left { display: flex; gap: 12px; }
.btn-ghost { background: transparent; border: none; color: #6b7280; cursor: pointer; font-weight: 600; }

.confirmed-stamp { position: absolute; top: -30px; right: 40px; transform: rotate(12deg) scale(0); transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); opacity: 0; pointer-events: none; }
.confirmed-stamp.show { transform: rotate(12deg) scale(1); opacity: 1; }
.stamp-inner { border: 6px solid #22c55e; color: #22c55e; padding: 14px 24px; border-radius: 14px; background: rgba(4,4,15,.9); box-shadow: 0 0 30px rgba(34,197,94,.3); }
.stamp-check { font-size: 24px; margin-bottom: 4px; }
.stamp-text { font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: .1em; line-height: 1; }
.stamp-date { font-size: 10px; margin-top: 6px; font-weight: 700; opacity: .8; }

.mono { font-family: 'Space Mono', monospace; }
</style>
