<template>
  <BaseModal>
    <div class="popup-title header-border">
      <div class="title-with-icon">
        <span class="header-icon">🚀</span>
        {{ t('teachersList.modal.title') }}
      </div>
    </div>

    <div class="teacher-form custom-scroll">
      <!-- 🛡️ SECURITY & ACCOUNT -->
      <div class="form-card security-card">
        <div class="section-badge">{{ t('teachersList.modal.sections.account') }}</div>
        <div class="card-grid">
          <UiInput
            v-model="form.email"
            type="email"
            :label="t('teachersList.modal.fields.loginEmail')"
            placeholder="login@example.com"
            required
            class="premium-input"
          />
          <UiInput
            v-model="form.personalEmail"
            type="email"
            :label="t('teachersList.modal.fields.personalEmail')"
            placeholder="personal@example.com"
            class="premium-input"
          />
          <UiInput
            v-model="form.password"
            type="password"
            :label="t('teachersList.modal.fields.password')"
            placeholder="••••••••"
            required
            class="premium-input full-width"
          />
        </div>
      </div>

      <!-- 👤 PERSONAL PROFILE -->
      <div class="form-card profile-card mt-4">
        <div class="section-badge secondary">{{ t('teachersList.modal.sections.personal') }}</div>
        <div class="card-grid">
          <UiInput
            v-model="form.firstName"
            :label="t('teachersList.modal.fields.firstName')"
            :placeholder="t('teachersList.modal.fields.firstName')"
            required
            class="premium-input"
          />
          <UiInput
            v-model="form.lastName"
            :label="t('teachersList.modal.fields.lastName')"
            :placeholder="t('teachersList.modal.fields.lastName')"
            required
            class="premium-input"
          />
          <UiInput
            v-model="form.phone"
            type="tel"
            :label="t('teachersList.modal.fields.phone')"
            placeholder="+48..."
            required
            class="premium-input"
          />
          <UiInput
            v-model="form.birthDate"
            type="date"
            :label="t('teachersList.modal.fields.birthDate')"
            class="premium-input"
          />
          <UiInput
            v-model="form.idCard"
            :label="t('teachersList.modal.fields.idCard')"
            placeholder="ABC 123456"
            class="premium-input"
          />
          <UiInput
            v-model="form.pesel"
            :label="t('teachersList.modal.fields.pesel')"
            placeholder="00000000000"
            class="premium-input"
          />
          <UiInput
            v-model="form.country"
            :label="t('teachersList.modal.fields.country')"
            placeholder="Poland"
            required
            class="premium-input full-width"
          />
        </div>
      </div>

      <!-- 🌍 LANGUAGES -->
      <div class="form-card language-card mt-4">
        <div class="section-badge info">{{ t('teachersList.modal.fields.languages') }}</div>
        <div class="languages-pills mt-2">
          <label v-for="lang in ['PL', 'EN', 'UK']" :key="lang" class="lang-pill" :class="{ active: form.languages.includes(lang) }">
            <input type="checkbox" v-model="form.languages" :value="lang" class="hidden-check">
            <span class="pill-text">{{ lang }}</span>
          </label>
        </div>
      </div>

      <!-- 📍 LOCATION DETAILS -->
      <div class="form-card location-card mt-4">
        <div class="section-badge info">{{ t('teachersList.modal.fields.city') }}</div>
        <div class="card-grid">
          <UiInput
            v-model="form.city"
            :label="t('teachersList.modal.fields.city')"
            placeholder="Warsaw"
            required
            class="premium-input"
          />
          <UiInput
            v-model="form.voivodeship"
            :label="t('teachersList.modal.fields.voivodeship')"
            placeholder="Mazowieckie"
            class="premium-input"
          />
          <div class="address-triple-grid full-width">
            <UiInput
              v-model="form.street"
              :label="t('teachersList.modal.fields.street')"
              placeholder="Marszałkowska 1"
              class="premium-input"
            />
            <UiInput
              v-model="form.apt"
              :label="t('teachersList.modal.fields.apt')"
              placeholder="12"
              class="premium-input small-input"
            />
            <UiInput
              v-model="form.postCode"
              :label="t('teachersList.modal.fields.postCode')"
              placeholder="00-001"
              class="premium-input small-input"
            />
          </div>
        </div>
      </div>

      <!-- 📅 AVAILABILITY & NOTES -->
      <div class="form-card schedule-card mt-4">
        <div class="section-badge alert">{{ t('teachersList.modal.fields.availability') }}</div>
        
        <div class="days-pills mt-2">
          <label v-for="day in daysOfWeek" :key="day" class="day-pill" :class="{ active: form.availability.includes(day) }">
            <input type="checkbox" v-model="form.availability" :value="day" class="hidden-check">
            <span class="pill-text">{{ t('newGroups.weekdays.' + day).slice(0, 3) }}</span>
          </label>
        </div>

        <div class="comment-group mt-4">
          <div class="pill-label">{{ t('teachersList.modal.fields.comment') }}</div>
          <textarea
            v-model="form.comment"
            class="premium-textarea"
            :placeholder="t('teachersList.modal.fields.commentPlaceholder')"
          ></textarea>
        </div>
      </div>

      <div v-if="error" class="error-toast">{{ error }}</div>
    </div>

    <!-- 🚀 STICKY FOOTER -->
    <div class="sticky-footer">
      <div class="footer-shadow"></div>
      <div class="footer-content">
        <UiButton variant="ghost" @click="close" class="action-btn">{{ t('common.cancel') }}</UiButton>
        <UiButton
          variant="primary"
          :loading="loading"
          :disabled="!isFormValid || loading"
          @click="submit"
          class="action-btn glow-btn"
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
  birthDate: "",
  languages: [] as string[],
  idCard: "",
  pesel: "",
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
.popup-title {
  margin-bottom: 0;
  padding: 24px 28px 16px;
  position: relative;
  z-index: 2;
  background: var(--card, #ffffff);
  border-radius: 20px 20px 0 0;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main, #0f172a);
}

.header-icon {
  font-size: 24px;
}

.header-border::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 28px;
  right: 28px;
  height: 1px;
  background: var(--border, rgba(0, 0, 0, 0.08));
}

.teacher-form {
  display: flex;
  flex-direction: column;
  padding: 12px 28px 100px;
  max-height: 70vh;
  overflow-y: auto;
  gap: 20px;
  background: var(--card, #ffffff);
}

/* Custom Scroll */
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: var(--blue, #4f6ef7); opacity: 0.2; border-radius: 4px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }

.form-card {
  background: var(--app-surface, #f8fafc);
  border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
  border-radius: 16px;
  padding: 20px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-card:hover {
  background: var(--app-surface);
  border-color: var(--border-hi, rgba(0, 0, 0, 0.15));
  box-shadow: var(--app-shadow, 0 4px 12px rgba(0,0,0,0.05));
  transform: translateY(-2px);
}

.section-badge {
  position: absolute;
  top: -10px;
  left: 20px;
  background: var(--status-info-bg, rgba(79, 110, 247, 0.1));
  color: var(--blue, #4f6ef7);
  font-size: 10px;
  font-weight: 800;
  padding: 2px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: 1px solid rgba(79, 110, 247, 0.2);
}

.section-badge.secondary { background: var(--status-warning-bg, rgba(139, 92, 246, 0.1)); color: var(--purple, #8b5cf6); border-color: rgba(139, 92, 246, 0.2); }
.section-badge.info { background: var(--status-info-bg, rgba(6, 182, 212, 0.1)); color: var(--cyan, #06b6d4); border-color: rgba(6, 182, 212, 0.2); }
.section-badge.alert { background: var(--status-danger-bg, rgba(236, 72, 153, 0.1)); color: var(--pink, #ec4899); border-color: rgba(236, 72, 153, 0.2); }

.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.full-width { grid-column: span 2; }

.address-triple-grid {
  display: grid;
  grid-template-columns: 1.5fr 0.5fr 1fr;
  gap: 12px;
}

.small-input { max-width: 100%; }

/* Redesigned Day Pills */
.days-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;
}

.day-pill {
  flex: 1;
  min-width: 44px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card, #ffffff);
  border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.day-pill:hover {
  background: var(--status-danger-bg, rgba(236, 72, 153, 0.05));
  border-color: rgba(236, 72, 153, 0.2);
  transform: translateY(-1px);
}

.day-pill.active {
  background: var(--pink, #ec4899);
  border-color: var(--pink, #ec4899);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
  color: white;
}

.pill-text {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--app-text-dim, #64748b);
}

.day-pill.active .pill-text {
  color: #fff;
}

/* Languages pills */
.languages-pills {
  display: flex;
  gap: 12px;
}

.lang-pill {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card, #ffffff);
  border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.lang-pill:hover {
  background: var(--status-info-bg, rgba(6, 182, 212, 0.05));
  border-color: rgba(6, 182, 212, 0.2);
  transform: translateY(-1px);
}

.lang-pill.active {
  background: var(--blue, #4f6ef7);
  border-color: var(--blue, #4f6ef7);
  box-shadow: 0 4px 12px rgba(79, 110, 247, 0.3);
  color: white;
}

.lang-pill.active .pill-text {
  color: #fff;
}

.pill-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--app-text-dim, #64748b);
  margin-bottom: 8px;
  padding-left: 2px;
}

.premium-textarea {
  width: 100%;
  background: var(--card, #ffffff);
  border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
  border-radius: 12px;
  padding: 14px;
  color: var(--app-text-main, #0f172a);
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  outline: none;
  min-height: 100px;
  resize: none;
  transition: all 0.2s;
}

.premium-textarea:focus {
  border-color: var(--pink, #ec4899);
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.sticky-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-radius: 0 0 20px 20px;
  overflow: hidden;
}

.footer-shadow {
  position: absolute;
  top: -24px;
  left: 0;
  right: 0;
  height: 24px;
  background: linear-gradient(to top, var(--app-card), transparent);
  pointer-events: none;
}

.footer-content {
  width: 100%;
  height: 100%;
  background: var(--app-card, #ffffff);
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border, rgba(0, 0, 0, 0.08));
}

.action-btn {
  height: 44px;
  min-width: 130px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.glow-btn {
  box-shadow: 0 4px 12px rgba(79, 110, 247, 0.2);
  transition: all 0.3s;
}

.glow-btn:hover:not(:disabled) {
  box-shadow: 0 8px 16px rgba(79, 110, 247, 0.3);
  transform: translateY(-1px);
}

.error-toast {
  color: var(--status-danger, #ef4444);
  background: var(--status-danger-bg, rgba(239, 68, 68, 0.1));
  padding: 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  margin-top: 20px;
}

.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 24px; }
.mt-6 { margin-top: 32px; }

.hidden-check { display: none; }
</style>
