<template>
  <div class="panel-head">
    <div class="sh-row">
      <div class="av">{{ student?.initials || "—" }}</div>

      <div style="flex:1">
        <div class="s-name">{{ student?.name || "—" }}</div>
        <div class="s-meta">
          <span v-if="student">{{ student.age }} лет</span><div class="sep" v-if="student"></div>
          <span v-if="student">{{ student.parentName }} ({{ student.parentRole }})</span><div class="sep" v-if="student"></div>
          <span v-if="student" style="font-family:'Space Mono',monospace">{{ student.phone }}</span><div class="sep" v-if="student"></div>
          <span v-if="student" :style="{ color: student.statusColor || 'var(--green)' }">{{ student.status }}</span>
        </div>
        <div class="s-family" style="margin-top:8px; gap:10px">
          <div class="badge badge-blue">JWT</div>
          <div class="badge badge-purple">REST</div>
          <div class="badge badge-amber">Dialog Modals</div>
          <div class="badge badge-green">i18n (RU/UA/PL/EN)</div>
        </div>
      </div>

      <div style="text-align:right;flex-shrink:0; display:flex; flex-direction:column; gap:8px; align-items:flex-end">
        <div>
          <div style="font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)">{{ t("payments.balance") }}</div>
          <div style="font-family:'Space Mono',monospace;font-size:18px;font-weight:700" :style="{ color: student?.totalBalance?.color || 'var(--white)' }">
            {{ student?.totalBalance?.value || "—" }}
          </div>
        </div>

        <div style="display:flex; gap:6px; align-items:center; justify-content:flex-end; flex-wrap:wrap">
          <select class="popup-input" style="margin:0; padding:6px 10px; font-size:12px" :value="locale" @change="onLocale(($event.target as HTMLSelectElement).value)">
            <option value="ru">RU</option>
            <option value="uk">UA</option>
            <option value="pl">PL</option>
            <option value="en">EN</option>
          </select>
          <button class="btn btn-ghost btn-sm" @click="logout">🚪 {{ t("app.logout") }}</button>
        </div>
      </div>
    </div>

    <div class="tabs">
      <RouterLink class="tab" :class="{ active: isActive('student-payments') }" :to="{ name: 'student-payments', params: { id: student?.id || 's_1' } }">💳 {{ t("tabs.payments") }}</RouterLink>
      <RouterLink class="tab" :class="{ active: isActive('student-groups') }" :to="{ name: 'student-groups', params: { id: student?.id || 's_1' } }">🎓 {{ t("tabs.groups") }}</RouterLink>
      <RouterLink class="tab" :class="{ active: isActive('student-info') }" :to="{ name: 'student-info', params: { id: student?.id || 's_1' } }">👤 {{ t("tabs.info") }}</RouterLink>
      <RouterLink class="tab" :class="{ active: isActive('student-attendance') }" :to="{ name: 'student-attendance', params: { id: student?.id || 's_1' } }">📅 {{ t("tabs.attendance") }}</RouterLink>
      <RouterLink class="tab" :class="{ active: isActive('student-progress') }" :to="{ name: 'student-progress', params: { id: student?.id || 's_1' } }">⭐ {{ t("tabs.progress") }}</RouterLink>
      <RouterLink class="tab" :class="{ active: isActive('student-notes') }" :to="{ name: 'student-notes', params: { id: student?.id || 's_1' } }">📝 {{ t("tabs.notes") }}</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { setLocale } from "../../../app/i18n";
import { useAuthStore } from "../../../stores/auth.store";
import { usePaymentsStore } from "../../../stores/payments.store";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const auth = useAuthStore();
const payments = usePaymentsStore();

const student = computed(() => payments.student);

function isActive(name: string) {
  return route.name === name;
}

function onLocale(l: string) {
  setLocale(l as any);
}

function logout() {
  auth.logout();
  router.push({ name: "sign-in" });
}
</script>
