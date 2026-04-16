<template>
  <BaseModal>
    <div class="popup-title">{{ t('modals.attendance.title') }}</div>
    <div class="popup-sub">{{ rowLabel }}</div>

    <div class="popup-label">{{ t('modals.attendance.status') }}</div>
    <div class="status-buttons">
      <button
        v-for="option in statusOptions"
        :key="option.value"
        type="button"
        class="status-btn"
        :class="{ active: mark === option.value }"
        @click="selectMark(option.value)"
      >
        <span>{{ option.icon }}</span>
        <span>{{ option.label }}</span>
      </button>
    </div>

    <div class="popup-label">{{ t('modals.attendance.note') }}</div>
    <textarea class="popup-input popup-textarea" v-model="note" :placeholder="t('modals.attendance.notePh')"></textarea>

    <div v-if="errorMessage" class="popup-error">{{ errorMessage }}</div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t('common.cancel') }}</button>
      <button class="btn btn-primary" :disabled="saving" @click="save">{{ saving ? t('common.saving') : t('common.save') }}</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import BaseModal from "../BaseModal.vue";
import { useModalStore } from "../../stores/modal.store";
import { setAttendanceMark } from "../../api/studentApi";
import { useStudentTabsStore } from "../../stores/studentTabs.store";
import { usePaymentsStore } from "../../stores/payments.store";
import { parseApiError } from "../../api/errorHelper";

const { t } = useI18n();
const route = useRoute();
const modal = useModalStore();
const tabs = useStudentTabsStore();
const paymentsStore = usePaymentsStore();

const row = computed(() => (modal.payload as any)?.row);
const studentId = computed(() => (modal.payload as any)?.studentId || (route.params.id as string) || "");
const rowLabel = computed(() => (row.value ? `#${row.value.num} · ${row.value.date} · ${row.value.trainer || row.value.teacher || ''}` : ""));

const statusOptions = computed<Array<{ value: AttendanceMark; icon: string; label: string }>>(() => ([
  { value: "present", icon: "✓", label: t('attendance.present') },
  { value: "absent", icon: "✕", label: t('attendance.absent') },
  { value: "late", icon: "⏱", label: t('attendance.late') },
  { value: "makeup", icon: "🔄", label: t('attendance.makeup') },
  { value: "empty", icon: "—", label: t('modals.attendance.empty') },
]));

type AttendanceMark = "present" | "absent" | "late" | "makeup" | "empty";

const allowedMarks: AttendanceMark[] = ["present", "absent", "late", "makeup", "empty"];

function normalizeMark(value: unknown): AttendanceMark {
  const next = String(value || "").trim() as AttendanceMark;
  return allowedMarks.includes(next) ? next : "present";
}

const mark = ref<AttendanceMark>("present");
const note = ref("");
const saving = ref(false);
const errorMessage = ref("");

watch(
  row,
  (nextRow) => {
    mark.value = normalizeMark(nextRow?.mark);
    note.value = nextRow?.note ?? "";
    errorMessage.value = "";
  },
  { immediate: true }
);

function close() {
  modal.close();
}

function selectMark(value: AttendanceMark) {
  mark.value = value;
  errorMessage.value = "";
}

async function save() {
  if (!row.value?.id || !studentId.value) return close();
  saving.value = true;
  errorMessage.value = "";
  try {
    const finalStudentId = paymentsStore.currentStudentId || studentId.value || "s_1";
    const selectedMark = normalizeMark(mark.value);
    const res: { ok: true; row?: any } = await setAttendanceMark({
      studentId: finalStudentId,
      attendanceId: row.value.id,
      mark: selectedMark,
      note: note.value,
    });

    (tabs as any).updateAttendanceRow(res.row ?? {
      ...row.value,
      mark: selectedMark,
      note: note.value,
    });

    modal.close();
  } catch (e: unknown) {
    errorMessage.value = parseApiError(e, t('common.error'));
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.status-buttons {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}

.status-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--b);
  background: rgba(255,255,255,.02);
  color: var(--white);
  cursor: pointer;
  transition: all .15s;
  font-size: 12px;
  font-weight: 600;
}

.status-btn:hover {
  border-color: rgba(79,110,247,.35);
  background: rgba(79,110,247,.08);
}

.status-btn.active {
  border-color: rgba(79,110,247,.55);
  background: rgba(79,110,247,.16);
  color: var(--blue);
}

.popup-textarea {
  min-height: 88px;
  resize: vertical;
}

.popup-error {
  margin: 8px 0 12px;
  color: var(--red);
  font-size: 12px;
}
</style>

