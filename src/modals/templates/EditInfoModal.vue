<template>
  <BaseModal>
    <div class="popup-title">{{ t('modals.editInfo.title') }}</div>
    <div class="popup-sub">{{ t('modals.editInfo.subtitle') }}</div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t('info.fullName') }}</div>
        <input class="popup-input" v-model="form.childFullName" />
      </div>
      <div>
        <div class="popup-label">{{ t('info.birthDate') }}</div>
        <input class="popup-input" v-model="form.birthDate" placeholder="DD.MM.YYYY" />
      </div>
    </div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t('info.parentData') }}</div>
        <input class="popup-input" v-model="form.parentFullName" />
      </div>
      <div>
        <div class="popup-label">{{ t('info.phone') }}</div>
        <input class="popup-input" v-model="form.phone" />
      </div>
    </div>

    <div>
      <div class="popup-label">{{ t('info.email') }}</div>
      <input class="popup-input" v-model="form.email" />
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t('common.cancel') }}</button>
      <button class="btn btn-primary" :disabled="saving" @click="save">{{ saving ? t('common.saving') : t('common.save') }}</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseModal from "../BaseModal.vue";
import { useModalStore } from "../../stores/modal.store";
import { updateStudentInfo } from "../../api/studentApi";
import { useStudentTabsStore } from "../../stores/studentTabs.store";

const { t } = useI18n();
const modal = useModalStore();
const tabs = useStudentTabsStore();
const payload = computed(() => modal.payload as any);

const info = computed(() => payload.value?.info);
const saving = ref(false);

const form = reactive({
  childFullName: info.value?.child?.fullName ?? "",
  birthDate: info.value?.child?.birthDate ?? "",
  parentFullName: info.value?.parent?.fullName ?? "",
  phone: info.value?.parent?.phone ?? "",
  email: info.value?.parent?.email ?? "",
});

function close() {
  modal.close();
}

async function save() {
  saving.value = true;
  try {
    await updateStudentInfo({
      studentId: "s_1",
      patch: {
        child: { ...info.value?.child, fullName: form.childFullName, birthDate: form.birthDate },
        parent: { ...info.value?.parent, fullName: form.parentFullName, phone: form.phone, email: form.email },
      },
    });
    await tabs.loadInfo("s_1");
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>
