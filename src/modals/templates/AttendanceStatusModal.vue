<template>
  <BaseModal>
    <div class="popup-title">{{ t('modals.attendance.title') }}</div>
    <div class="popup-sub">{{ rowLabel }}</div>

    <div class="popup-label">{{ t('modals.attendance.status') }}</div>
    <select class="popup-input" v-model="mark">
      <option value="present">✓ {{ t('attendance.present') }}</option>
      <option value="absent">✕ {{ t('attendance.absent') }}</option>
      <option value="late">⏱ {{ t('attendance.late') }}</option>
      <option value="makeup">🔄 {{ t('attendance.makeup') }}</option>
      <option value="empty">— {{ t('modals.attendance.empty') }}</option>
    </select>

    <div class="popup-label">{{ t('modals.attendance.note') }}</div>
    <input class="popup-input" v-model="note" :placeholder="t('modals.attendance.notePh')" />

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
import { setAttendanceMark } from "../../api/studentApi";
import { useStudentTabsStore } from "../../stores/studentTabs.store";
import { usePaymentsStore } from "../../stores/payments.store";

const { t } = useI18n();
const modal = useModalStore();
const tabs = useStudentTabsStore();
const paymentsStore = usePaymentsStore();

const row = computed(() => (modal.payload as any)?.row);
const rowLabel = computed(() => (row.value ? `#${row.value.num} · ${row.value.date} · ${row.value.trainer}` : ""));

const mark = ref(row.value?.mark ?? "empty");
const note = ref(row.value?.note ?? "");
const saving = ref(false);

function close() {
  modal.close();
}

async function save() {
  if (!row.value?.id) return close();
  saving.value = true;
  try {
    const studentId = paymentsStore.currentStudentId || "s_1";
    await setAttendanceMark({
      studentId,
      attendanceId: row.value.id,
      mark: mark.value,
      note: note.value,
    });
    await tabs.loadAttendance(studentId);
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>
