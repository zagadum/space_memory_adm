<template>
  <div class="panel-head">
    <div class="student-row">
      <div class="av">{{ student?.initials || "—" }}</div>

      <div style="flex:1">
        <div class="s-name">{{ student?.name || "—" }}</div>
        <div class="s-meta">
          <span>{{ student?.age || "" }}</span><div class="sep"></div>
          <span>{{ student?.parent || "" }}</span><div class="sep"></div>
          <span style="font-family:'Space Mono',monospace">{{ student?.phone || "" }}</span><div class="sep"></div>
          <span :style="{ color: student?.statusColor || 'var(--dim)' }">{{ student?.statusLabel || "" }}</span>
        </div>
        <div class="s-family" style="margin-top:8px; gap:10px">
          <div class="badge badge-blue">JWT</div>
          <div class="badge badge-purple">REST</div>
          <div class="badge badge-amber">Dialog Modals</div>
          <div class="badge badge-green">i18n (UA/PL/EN)</div>
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
            <option value="uk">UA</option>
            <option value="pl">PL</option>
            <option value="en">EN</option>
          </select>
          <button class="btn btn-ghost btn-sm" @click="logout">🚪 {{ t("app.logout") }}</button>
        </div>
      </div>
    </div>

    <div class="tabs">
      <RouterLink class="tab" :class="{ active: isActive('payments') }" to="/payments">💳 {{ t("tabs.payments") }}</RouterLink>
      <RouterLink class="tab" :class="{ active: isActive('groups') }" to="/groups">🎓 {{ t("tabs.groups") }}</RouterLink>
      <RouterLink class="tab" :class="{ active: isActive('info') }" to="/info">👤 {{ t("tabs.info") }}</RouterLink>
      <RouterLink class="tab" :class="{ active: isActive('attendance') }" to="/attendance">📅 {{ t("tabs.attendance") }}</RouterLink>
      <RouterLink class="tab" :class="{ active: isActive('progress') }" to="/progress">⭐ {{ t("tabs.progress") }}</RouterLink>
      <RouterLink class="tab" :class="{ active: isActive('notes') }" to="/notes">📝 {{ t("tabs.notes") }}</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { setLocale } from "../../app/i18n";
import { useAuthStore } from "../../stores/auth.store";
import { usePaymentsStore } from "../../stores/payments.store";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const auth = useAuthStore();
const payments = usePaymentsStore();

const student = computed(() => payments.student);

function isActive(tab: string) {
  return route.path.startsWith("/" + tab);
}

function onLocale(l: string) {
  setLocale(l as any);
}

function logout() {
  auth.logout();
  router.push({ name: "sign-in" });
}
</script>
