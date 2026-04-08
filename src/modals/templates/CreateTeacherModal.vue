<template>
  <BaseModal>
    <div class="popup-title">{{ t('teachersList.modal.title') }}</div>

    <div class="teacher-form">
      <!-- Данные аккаунта -->
      <div class="form-section">
        <div class="section-label">{{ t('teachersList.modal.sections.account') }}</div>
        <div class="popup-2col">
          <UiInput
            v-model="form.email"
            type="email"
            :label="t('teachersList.modal.fields.loginEmail')"
            placeholder="login@example.com"
            required
          />
          <UiInput
            v-model="form.personalEmail"
            type="email"
            :label="t('teachersList.modal.fields.personalEmail')"
            placeholder="personal@example.com"
          />
        </div>
        <UiInput
          v-model="form.password"
          type="password"
          :label="t('teachersList.modal.fields.password')"
          placeholder="••••••••"
          required
        />
      </div>

      <!-- Личные данные -->
      <div class="form-section mt-4">
        <div class="section-label">{{ t('teachersList.modal.sections.personal') }}</div>
        <div class="popup-2col">
          <UiInput
            v-model="form.firstName"
            :label="t('teachersList.modal.fields.firstName')"
            :placeholder="t('teachersList.modal.fields.firstName')"
            required
          />
          <UiInput
            v-model="form.lastName"
            :label="t('teachersList.modal.fields.lastName')"
            :placeholder="t('teachersList.modal.fields.lastName')"
            required
          />
        </div>
        <div class="popup-2col">
          <UiInput
            v-model="form.phone"
            type="tel"
            :label="t('teachersList.modal.fields.phone')"
            placeholder="+48..."
            required
          />
          <UiInput
            v-model="form.country"
            :label="t('teachersList.modal.fields.country')"
            placeholder="Poland"
            required
          />
        </div>
        <div class="popup-2col">
          <UiInput
            v-model="form.voivodeship"
            :label="t('teachersList.modal.fields.voivodeship')"
            placeholder="Mazowieckie"
          />
          <UiInput
            v-model="form.city"
            :label="t('teachersList.modal.fields.city')"
            placeholder="Warsaw"
            required
          />
        </div>
        <div class="popup-3col">
          <UiInput
            v-model="form.postCode"
            :label="t('teachersList.modal.fields.postCode')"
            placeholder="00-001"
          />
          <UiInput
            v-model="form.street"
            :label="t('teachersList.modal.fields.street')"
            placeholder="Marszałkowska 1"
          />
          <UiInput
            v-model="form.apt"
            :label="t('teachersList.modal.fields.apt')"
            placeholder="12"
          />
        </div>
      </div>

      <!-- Дополнительно и доступность -->
      <div class="form-section mt-4">
        <div class="section-label">{{ t('teachersList.modal.sections.other') }}</div>
        <div class="popup-label">{{ t('teachersList.modal.fields.comment') }}</div>
        <textarea
          v-model="form.comment"
          class="popup-textarea"
          :placeholder="t('teachersList.modal.fields.commentPlaceholder')"
        ></textarea>

        <div class="availability-container mt-4">
          <div class="popup-label">{{ t('teachersList.modal.fields.availability') }}</div>
          <div class="days-grid">
            <label v-for="day in daysOfWeek" :key="day" class="day-card" :class="{ active: form.availability.includes(day) }">
              <input type="checkbox" v-model="form.availability" :value="day" class="hidden-check">
              <span class="day-name">{{ t('newGroups.weekdays.' + day) }}</span>
            </label>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-msg">{{ error }}</div>

      <div class="popup-actions mt-6">
        <UiButton variant="ghost" @click="close">{{ t('common.cancel') }}</UiButton>
        <UiButton
          variant="primary"
          :loading="loading"
          :disabled="!isFormValid || loading"
          @click="submit"
        >
          {{ t('common.create') }}
        </UiButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseModal from "../BaseModal.vue";
import UiInput from "../../components/ui/UiInput.vue";
import UiButton from "../../components/ui/UiButton.vue";
import { useModalStore } from "../../stores/modal.store";
import { useTeachersListStore } from "../../stores/teachersList.store";
import { useNotificationStore } from "../../stores/notification.store";

const { t } = useI18n();
const modal = useModalStore();
const teachersStore = useTeachersListStore();
const notificationStore = useNotificationStore();

const loading = ref(false);
const error = ref<string | null>(null);

const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const form = reactive({
  email: "",
  personalEmail: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  country: "",
  voivodeship: "",
  city: "",
  postCode: "",
  street: "",
  apt: "",
  comment: "",
  availability: [] as string[],
});

const isFormValid = computed(() => {
  return (
    form.email &&
    form.password &&
    form.password.length >= 6 &&
    form.firstName &&
    form.lastName &&
    form.phone &&
    form.country &&
    form.city
  );
});

function close() {
  modal.close();
}

async function submit() {
  if (!isFormValid.value) return;
  
  loading.value = true;
  error.value = null;
  try {
    await teachersStore.addTeacher({ ...form });
    notificationStore.addToast(t('teachersList.modal.success'), 'success');
    modal.close();
  } catch (err: any) {
    error.value = err.response?.data?.message || t('teachersList.modal.error');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.teacher-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 16px;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}

.teacher-form::-webkit-scrollbar { width: 4px; }
.teacher-form::-webkit-scrollbar-thumb { background: rgba(100, 120, 255, 0.2); border-radius: 4px; }

.form-section {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--blue, #4f6ef7);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
  opacity: 0.8;
}

.popup-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.popup-3col { display: grid; grid-template-columns: 80px 1fr 80px; gap: 12px; }

.popup-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dim, #8892b0);
  margin-bottom: 5px;
  display: block;
}

.popup-textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(100, 120, 255, 0.15);
  border-radius: 8px;
  padding: 9px 12px;
  color: var(--white, #e8eeff);
  font-family: inherit;
  font-size: 13px;
  outline: none;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s;
}

.popup-textarea:focus { border-color: var(--blue, #4f6ef7); }

.days-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.day-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.day-card:hover { background: rgba(79, 110, 247, 0.05); border-color: rgba(79, 110, 247, 0.2); }
.day-card.active {
  background: rgba(79, 110, 247, 0.15);
  border-color: var(--blue, #4f6ef7);
  box-shadow: 0 0 10px rgba(79, 110, 247, 0.2);
}

.day-name { font-size: 11px; font-weight: 600; color: var(--app-text-dim); }
.day-card.active .day-name { color: var(--white); }

.hidden-check { display: none; }

.error-msg {
  color: var(--red, #ef4444);
  font-size: 13px;
  margin-top: 12px;
  text-align: center;
  padding: 8px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
}

.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
</style>
