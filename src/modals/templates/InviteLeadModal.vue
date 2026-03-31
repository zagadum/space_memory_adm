<template>
  <BaseModal>
    <div class="popup-title">{{ t('recruitment.inviteLead') }}</div>
    <div class="popup-sub" v-if="displayData">{{ displayData.name }} — {{ displayData.source }}</div>

    <div class="invite-form">
      <div class="popup-2col">
        <UiInput
          v-model="form.firstName"
          :label="t('recruitment.form.firstName')"
          :placeholder="t('recruitment.form.firstName')"
          required
        />
        <UiInput
          v-model="form.lastName"
          :label="t('recruitment.form.lastName')"
          :placeholder="t('recruitment.form.lastName')"
          required
        />
      </div>

      <div class="popup-2col">
        <UiInput
          v-model="form.parentEmail"
          type="email"
          :label="t('recruitment.form.parentEmail')"
          placeholder="parent@example.com"
          required
        />
        <UiInput
          v-model="form.studentEmail"
          type="email"
          :label="t('recruitment.form.studentEmail')"
          placeholder="student_nickname"
          required
        />
      </div>
      <div class="hint-text">{{ t('recruitment.form.studentEmailHint') }}</div>

      <div class="popup-2col mt-4">
        <UiInput
          v-model="form.phone"
          type="tel"
          :label="t('recruitment.form.phone')"
          placeholder="+48..."
        />
        <div>
          <div class="popup-label">{{ t('recruitment.form.contract') }}</div>
          <select class="popup-input" v-model="form.contractType">
            <option value="contract_399">Contract 399 zł</option>
            <option value="contract_489">Contract 489 zł</option>
            <option value="contract_600">Contract 600 zł</option>
            <option value="contract_689">Contract 689 zł</option>
          </select>
        </div>
      </div>

      <div class="popup-2col">
        <UiInput
          v-model="form.subscriptionAmount"
          type="number"
          :label="t('recruitment.form.subscriptionAmount')"
          placeholder="489"
        />
        <UiInput
          v-model="form.discount"
          type="number"
          :label="t('recruitment.form.discount')"
          placeholder="0"
        />
      </div>

      <div v-if="error" class="error-msg">{{ error }}</div>
      <div v-if="success" class="success-msg">{{ t('recruitment.inviteSuccess') }}</div>

      <div class="popup-actions mt-6">
        <UiButton variant="ghost" @click="close">{{ t('common.cancel') }}</UiButton>
        <UiButton
          variant="primary"
          :loading="loading"
          :disabled="!isFormValid || loading || success"
          @click="submit"
        >
          {{ t('recruitment.form.submit') }}
        </UiButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import BaseModal from "../BaseModal.vue";
import UiInput from "../../components/ui/UiInput.vue";
import UiButton from "../../components/ui/UiButton.vue";
import { useModalStore } from "../../stores/modal.store";
import { useLeadsStore } from "../../stores/leads.store";
import type { RecruitmentBackend } from "../../api/http";

const { t } = useI18n();
const route = useRoute();
const modal = useModalStore();
const leadsStore = useLeadsStore();

const payload = computed(() => modal.payload as any);
const lead = computed(() => payload.value?.lead);
const student = computed(() => payload.value?.student);

// Определяем backend: сначала из payload (явная передача), затем из meta текущего маршрута
const backend = computed<RecruitmentBackend>(() => {
  if (payload.value?.backend === 'indigo') return 'indigo';
  if ((route.meta as any)?.recruitmentBackend === 'indigo') return 'indigo';
  return 'default';
});

const displayData = computed(() => {
  if (student.value) {
    return {
      name: student.value.name,
      email: student.value.email || "",
      phone: student.value.phone || "",
      source: t('newStudents.inviteStudent')
    }
  }
  if (lead.value) {
    return {
      name: lead.value.name,
      email: lead.value.email || "",
      phone: lead.value.phone || "",
      source: lead.value.source
    }
  }
  return null
})

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const form = reactive({
  firstName: displayData.value?.name?.split(" ")[0] || "",
  lastName: displayData.value?.name?.split(" ").slice(1).join(" ") || "",
  parentEmail: displayData.value?.email || "",
  studentEmail: "",
  phone: displayData.value?.phone || "",
  subscriptionAmount: "489",
  contractType: "contract_489",
  discount: "0",
});

const isFormValid = computed(() => {
  return (
    form.firstName &&
    form.lastName &&
    form.parentEmail &&
    form.studentEmail &&
    form.contractType
  );
});

function close() {
  modal.close();
}

async function submit() {
  loading.value = true;
  error.value = null;
  try {
    console.log('[InviteLeadModal] backend:', backend.value, '| route.meta:', route.meta?.recruitmentBackend, '| payload.backend:', payload.value?.backend);
    await leadsStore.inviteLead({
      first_name: form.firstName,
      surname: form.lastName,
      email: form.parentEmail,
      parent_email: form.parentEmail,
      nickname: form.studentEmail,
      phone: form.phone,
      subscription_amount: Number(form.subscriptionAmount),
      contract_old_new: form.contractType,
      discount: form.discount ? Number(form.discount) : 0,
      balance_overpayment: 0,
    }, backend.value);

    success.value = true;
    setTimeout(() => {
        modal.close();
    }, 1500);
  } catch (err: any) {
    error.value = err.response?.data?.message || t('recruitment.inviteError');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.invite-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.hint-text {
  font-size: 11px;
  color: var(--dim, #8892b0);
  margin-top: -8px;
  margin-bottom: 8px;
}

.error-msg {
  color: var(--red, #ef4444);
  font-size: 13px;
  margin-top: 8px;
  text-align: center;
}

.success-msg {
  color: var(--green, #10b981);
  font-size: 13px;
  margin-top: 8px;
  text-align: center;
  font-weight: 600;
}

.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }

/* Matching UiInput look for select */
.popup-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dim, #8892b0);
  margin-bottom: 5px;
  display: block;
}

.popup-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(100, 120, 255, 0.15);
  border-radius: 8px;
  padding: 9px 12px;
  color: var(--white, #e8eeff);
  font-family: "Outfit", sans-serif;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.popup-input:focus {
  border-color: var(--blue, #4f6ef7);
}

select.popup-input option {
    background: #0d0d24;
    color: #e8eeff;
}
</style>
