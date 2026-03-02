<template>
  <BaseModal>
    <div class="popup-title">{{ t('modals.changeGroup.title') }}</div>
    <div class="popup-sub">{{ t('modals.changeGroup.subtitle') }}</div>

    <div class="popup-label">{{ t('modals.changeGroup.program') }}</div>
    <div class="popup-input" style="display:flex;align-items:center;gap:8px">
      <span style="font-weight:700">{{ payload?.group?.programTitle }}</span>
      <span style="color:var(--dim)">·</span>
      <span style="font-family:'Space Mono',monospace;color:var(--dim)">{{ t('groups.group') }} {{ payload?.group?.group?.code }}</span>
    </div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t('modals.changeGroup.from') }}</div>
        <input class="popup-input" :value="payload?.group?.group?.code" disabled />
      </div>
      <div>
        <div class="popup-label">{{ t('modals.changeGroup.to') }}</div>
        <select class="popup-input" v-model="to">
          <option v-for="g in options" :key="g" :value="g">{{ t('groups.group') }} {{ g }}</option>
        </select>
      </div>
    </div>

    <div class="popup-label">{{ t('modals.changeGroup.reason') }}</div>
    <input class="popup-input" v-model="reason" :placeholder="t('modals.changeGroup.reasonPh')" />

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t('common.cancel') }}</button>
      <button class="btn btn-primary" :disabled="saving" @click="save">{{ saving ? t('common.saving') : t('common.save') }}</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseModal from "../BaseModal.vue";
import { useModalStore } from "../../stores/modal.store";
import { changeStudentGroup, getStudentGroups } from "../../api/studentApi";
import { useStudentTabsStore } from "../../stores/studentTabs.store";

const { t } = useI18n();
const modal = useModalStore();
const tabs = useStudentTabsStore();
const payload = computed(() => modal.payload as any);

const options = ["A", "B", "C", "D", "E"];
const to = ref("B");
const reason = ref("");
const saving = ref(false);

function close() {
  modal.close();
}

async function save() {
  const g = payload.value?.group;
  if (!g) return close();
  saving.value = true;
  try {
    await changeStudentGroup({
      studentId: "s_1",
      programId: g.programId,
      fromGroup: g.group.code,
      toGroup: to.value,
      reason: reason.value,
    });
    // refresh groups
    await tabs.loadGroups("s_1");
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>
