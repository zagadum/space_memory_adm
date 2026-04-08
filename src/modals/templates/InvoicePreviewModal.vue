<template>
  <BaseModal popupClass="popup-invoice-preview">
    <div class="preview-header">
      <div class="popup-title">📄 {{ invoice?.number || 'Invoice Preview' }}</div>
      <div class="header-actions">
        <UiButton variant="ghost" size="sm" @click="download">
          ⬇️ {{ t('faktury.downloadPdf') }}
        </UiButton>
        <UiButton variant="ghost" size="sm" @click="close">
          ✕
        </UiButton>
      </div>
    </div>
    
    <div class="preview-body">
      <div v-if="loading" class="preview-loading">
        <div class="loader"></div>
        <span>{{ t('common.loading') }}...</span>
      </div>
      <iframe 
        v-show="!loading"
        :src="pdfUrl" 
        class="pdf-frame" 
        @load="onLoad"
      ></iframe>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseModal from '../BaseModal.vue';
import UiButton from '../../components/ui/UiButton.vue';
import { useModalStore } from '../../stores/modal.store';
import { invoicesApi } from '../../api/invoices.api';

const { t } = useI18n();
const modal = useModalStore();

const invoice = computed(() => modal.payload as any);
const pdfUrl = computed(() => invoice.value ? invoicesApi.getPdfUrl(invoice.value.id) : '');

const loading = ref(true);

function onLoad() {
  loading.value = false;
}

function close() {
  modal.close();
}

function download() {
  if (pdfUrl.value) {
    window.open(pdfUrl.value, '_blank');
  }
}
</script>

<style scoped>
.popup-invoice-preview { 
  max-width: 900px; 
  width: 90%; 
  height: 90vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(100, 120, 255, 0.15);
  background: var(--app-surface);
}

.header-actions { display: flex; gap: 8px; }

.preview-body {
  flex: 1;
  position: relative;
  background: #525659; /* Standard PDF viewer background */
}

.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: white;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.popup-title { margin-bottom: 0; font-size: 16px; }
</style>
