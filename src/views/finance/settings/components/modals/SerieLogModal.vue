<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="mhdr">
        <div class="mhl">
          <div class="mhico">🔒</div>
          <div>
            <div class="mtitle">{{ $t('financeSettings.numbering.modalTitle') }}</div>
            <div class="msub">{{ $t('financeSettings.numbering.modalSub') }}</div>
          </div>
        </div>
        <div class="mclose" @click="$emit('close')">✕</div>
      </div>
      <div class="mbody">
        <div class="ibox ibox-red">
          <div class="ibox-icon">⚠</div>
          <div>{{ $t('financeSettings.numbering.modalInfo') }}</div>
        </div>
        
        <div class="log-rows">
          <div class="log-row">
            <div class="log-val">042 → 043 (auto)</div>
            <div class="log-meta">15.05.2025 10:32 · System · TXN-2025-04821</div>
          </div>
          <div class="log-row">
            <div class="log-val">041 → 042 (auto)</div>
            <div class="log-meta">15.05.2025 09:14 · System · TXN-2025-04819</div>
          </div>
        </div>
      </div>
      <div class="mfooter">
        <button class="btn btn-ghost" @click="$emit('close')">{{ $t('common.close') || 'Zamknij' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['close'])
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #0c0c24;
  border: 1px solid rgba(100, 120, 255, 0.2);
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.mhdr {
  padding: 18px 20px;
  border-bottom: 1px solid rgba(100, 120, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mhl { display: flex; align-items: center; gap: 14px; }
.mhico {
  width: 38px;
  height: 38px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.mtitle { font-size: 15px; font-weight: 800; color: #e8eeff; }
.msub { font-size: 11px; color: #8892b0; margin-top: 2px; }
.mclose { cursor: pointer; color: #8892b0; font-size: 18px; }

.mbody { padding: 20px; }

.ibox {
  padding: 12px 14px;
  border-radius: 9px;
  font-size: 11.5px;
  display: flex;
  gap: 10px;
  line-height: 1.5;
  margin-bottom: 16px;
}
.ibox-red {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ffb4b4;
}
.ibox-icon { font-size: 16px; flex-shrink: 0; }

.log-rows { display: flex; flex-direction: column; gap: 8px; }
.log-row {
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(100, 120, 255, 0.1);
  border-radius: 10px;
}
.log-val { font-family: 'Space Mono', monospace; color: #10b981; font-size: 12px; font-weight: 700; }
.log-meta { font-size: 10.5px; color: #8892b0; margin-top: 4px; }

.mfooter {
  padding: 14px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(100, 120, 255, 0.1);
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-family: 'Outfit', sans-serif;
  transition: all .15s;
}
.btn-ghost {
  background: rgba(255, 255, 255, 0.05);
  color: #8892b0;
  border: 1px solid rgba(100, 120, 255, 0.1);
}
.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e8eeff;
}
</style>
