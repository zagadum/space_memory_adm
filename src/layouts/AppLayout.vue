<template>
  <div class="demo">
    <div class="panel">
      <AppHeader />
      <div class="panel-body">
        <RouterView />
      </div>
    </div>
    <ModalHost />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
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
