<template>
  <div class="action-section">
    <div class="action-label">{{ t("payments.actions") }}</div>
    <div class="action-row">
      <button class="btn btn-amber btn-sm" @click="modal.open('pause', { programId })">🌙 {{ t("payments.btn.pause") }}</button>
      <button class="btn btn-ghost btn-sm" @click="modal.open('discount', { programId, year, monthIndex })">🏷️ {{ t("payments.btn.discount") }}</button>
      <button class="btn btn-ghost btn-sm" @click="modal.open('tariff', { programId, year, monthIndex })">💱 {{ t("payments.btn.tariff") }}</button>
      <button class="btn btn-pink btn-sm" @click="modal.open('extra', { programId })">➕ {{ t("payments.btn.extra") }}</button>
    </div>
    <div class="action-row">
      <button class="btn btn-unlock btn-sm" @click="modal.open('unlock', { programId })">🔓 {{ t("payments.btn.unlock") }}</button>
      <div class="action-divider"></div>
      <button class="btn btn-ghost btn-sm" @click="modal.open('groupSplit', { programId })">🔄 {{ t("payments.btn.split") }}</button>
      <button class="btn btn-archive btn-sm" @click="modal.open('archive', { programId })">📦 {{ t("payments.btn.archive") }}</button>
      <button class="btn btn-green btn-sm" @click="modal.open('resume', { programId })">▶ {{ t("payments.btn.resume") }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useModalStore } from "../../../../../stores/modal.store";

const { t } = useI18n();
const modal = useModalStore();

defineProps<{
  programId: string;
  year: string;
  monthIndex: number;
}>();
</script>

<style scoped>
.action-section { border-top: 1px solid rgba(100,120,255,.13); padding: 10px 16px; background: rgba(255,255,255,.01); }
.action-label { font-size: 9.5px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: var(--dim); margin-bottom: 7px; }
.action-row { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 5px; }
.action-divider { width: 1px; height: 26px; background: rgba(100,120,255,.13); flex-shrink: 0; align-self: center; }

.btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 8px; font-size: 12px; font-weight: 500; font-family: 'Outfit', sans-serif; cursor: pointer; border: none; transition: all .15s; white-space: nowrap; }
.btn-ghost { background: rgba(255,255,255,.05); color: var(--dim); border: 1px solid rgba(100,120,255,.13); }
.btn-ghost:hover { background: rgba(255,255,255,.08); color: var(--white); border-color: rgba(120,140,255,.30); }
.btn-amber { background: rgba(245,158,11,.1); color: var(--amber); border: 1px solid rgba(245,158,11,.28); }
.btn-green { background: rgba(16,185,129,.1); color: var(--green); border: 1px solid rgba(16,185,129,.28); }
.btn-pink { background: rgba(236,72,153,.1); color: var(--pink); border: 1px solid rgba(236,72,153,.28); }
.btn-archive { background: rgba(100,120,255,.06); color: var(--dim); border: 1px solid rgba(100,120,255,.15); }
.btn-unlock { background: rgba(6,182,212,.08); color: var(--cyan); border: 1px solid rgba(6,182,212,.22); }
.btn-sm { padding: 4px 9px; font-size: 11px; }
</style>
