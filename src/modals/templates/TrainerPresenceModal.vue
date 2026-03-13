<template>
  <BaseModal>
    <div class="popup-title">{{ t('modals.trainerPresence.title') }}</div>
    <div class="popup-sub">{{ t('modals.trainerPresence.subtitle') }}</div>

    <div class="popup-label">{{ t('modals.trainerPresence.trainer') }}</div>
    <div class="popup-input" style="display:flex;align-items:center;gap:8px">
      <span style="font-weight:800">{{ trainer?.name }}</span>
      <span style="color:var(--dim)">·</span>
      <span style="color:var(--dim)">{{ group?.programTitle }} · {{ t('groups.group') }} {{ group?.group?.code }}</span>
    </div>

    <div class="popup-label">{{ t('modals.trainerPresence.status') }}</div>
    <select class="popup-input" v-model="presence">
      <option value="present">✓ {{ t('attendance.present') }}</option>
      <option value="absent">✕ {{ t('attendance.absent') }}</option>
      <option value="late">⏱ {{ t('attendance.late') }}</option>
      <option value="makeup">🔄 {{ t('attendance.makeup') }}</option>
    </select>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t('common.cancel') }}</button>
      <button class="btn btn-primary" :disabled="saving" @click="save">{{ saving ? t('common.saving') : t('common.save') }}</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseModal from "../BaseModal.vue";
import { useModalStore } from "../../stores/modal.store";
import { setTrainerPresence } from "../../api/studentApi";
import { useStudentTabsStore } from "../../stores/studentTabs.store";
import { usePaymentsStore } from "../../stores/payments.store";

const { t } = useI18n();
const modal = useModalStore();
const tabs = useStudentTabsStore();
const paymentsStore = usePaymentsStore();
const payload = computed(() => modal.payload as any);

const group = computed(() => payload.value?.group);
const trainer = computed(() => payload.value?.trainer);
const presence = ref(trainer.value?.presence ?? "present");
const saving = ref(false);

function close() {
  modal.close();
}

async function save() {
  if (!group.value || !trainer.value) return close();
  saving.value = true;
  try {
    const studentId = paymentsStore.currentStudentId || "s_1";
    await setTrainerPresence({
      studentId,
      groupId: group.value.id,
      trainerId: trainer.value.id,
      presence: presence.value,
    });
    await tabs.loadGroups(studentId);
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>
