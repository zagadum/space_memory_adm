<template>
  <BaseModal popupClass="popup-tariff">
    <div class="popup-title">{{ t("modals.tariff.titleFull") }}</div>
    <div class="popup-sub">{{ t("modals.tariff.subtitle") }}</div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t("modals.tariff.program") }}</div>
        <select class="popup-input" v-model="programId">
          <option v-for="p in programs" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>
      <div>
        <div class="popup-label">{{ t("modals.tariff.value") }}</div>
        <input class="popup-input" v-model.number="value" type="number" min="0" />
      </div>
    </div>

    <div>
      <div class="popup-label">С месяца (0 = январь)</div>
      <input class="popup-input" v-model.number="fromMonthIndex" type="number" min="0" max="11" />
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t("common.cancel") }}</button>
      <button class="btn btn-amber" :disabled="saving" @click="save">
        {{ saving ? "Сохраняю…" : "Сохранить" }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed, ref, watchEffect } from "vue";
import BaseModal from "../BaseModal.vue";
import { useModalStore } from "../../stores/modal.store";
import { usePaymentsStore } from "../../stores/payments.store";
import { paymentsApi } from "../../api/paymentsApi";

const { t } = useI18n();

const modal = useModalStore();
const payments = usePaymentsStore();

const programs = computed(() => payments.programs);

const programId = ref<string>((modal.payload?.programId as string) || "space");
const value = ref<number>(490);
const fromMonthIndex = ref<number>((modal.payload?.monthIndex as number) ?? 0);
const saving = ref(false);

watchEffect(() => {
  const p = payments.programs.find(x => x.id === programId.value);
  if (p) value.value = p.tariff;
});

function close(){ modal.close(); }

async function save(){
  saving.value = true;
  try{
    await paymentsApi.changeTariff({ programId: programId.value, value: value.value, fromMonthIndex: fromMonthIndex.value });
    payments.updateTariff(programId.value, value.value);
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>
