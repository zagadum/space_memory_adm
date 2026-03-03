<template>
  <AppSidebar />
  <div class="main">
    <AppTopbar />
    <StudentsTablePlaceholder />

    <!-- Overlay logic for student panel; hardcoded open for now as routing shows student items -->
    <div class="sp-overlay active"></div>
    <div class="student-panel open">
      <AppHeader />
      <div class="sp-body">
        <RouterView />
      </div>
    </div>
    
    <ModalHost />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import AppSidebar from "../components/layout/AppSidebar.vue";
import AppTopbar from "../components/layout/AppTopbar.vue";
import StudentsTablePlaceholder from "../components/layout/StudentsTablePlaceholder.vue";
import AppHeader from "../components/header/AppHeader.vue";
import ModalHost from "../modals/ModalHost.vue";
import { useAuthStore } from "../stores/auth.store";
import { usePaymentsStore } from "../stores/payments.store";

const auth = useAuthStore();
const payments = usePaymentsStore();

onMounted(async () => {
  await auth.loadMe();
  if (!payments.student) await payments.loadStudent("s_1");
});
</script>
