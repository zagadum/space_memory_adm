<template>
  <div v-if="appStore.isGlobalLoading" class="global-loading-bar"></div>
  <AppSidebar />
  
  <!-- Mobile Overlay -->
  <div 
    class="mobile-overlay" 
    :class="{ active: appStore.isSidebarOpen }" 
    @click="appStore.toggleSidebar(false)"
  ></div>

  <div class="main">
    <AppTopbar />
    <RouterView />
    
    <ModalHost />
  </div>
  <ToastContainer />
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import AppSidebar from "../components/layout/AppSidebar.vue";
import AppTopbar from "../components/layout/AppTopbar.vue";
import ToastContainer from "../components/ui/ToastContainer.vue";
import ModalHost from "../modals/ModalHost.vue";
import { useAuthStore } from "../stores/auth.store";
import { useAppStore } from "../stores/app.store";
import { usePaymentsStore } from "../stores/payments.store";

const auth = useAuthStore();
const appStore = useAppStore();
const payments = usePaymentsStore();
const route = useRoute();

// Close sidebar on route change (mobile)
watch(() => route.path, () => {
  appStore.toggleSidebar(false);
});

onMounted(async () => {
  await auth.loadMe();
});
</script>

<style scoped>
.global-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--blue);
  z-index: 10000;
  overflow: hidden;
}

.global-loading-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: -50%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: loading-bar 1.5s infinite;
}

@keyframes loading-bar {
  from { left: -50%; }
  to { left: 100%; }
}
</style>
