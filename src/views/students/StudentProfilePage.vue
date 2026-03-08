<template>
  <div class="student-profile-wrapper">
    <!-- Back to table layer -> it can just be an overlay that routes back -->
    <div class="sp-overlay active" @click="closeProfile"></div>
    
    <div class="student-panel open">
      <StudentProfileHeader />
      <div class="sp-body">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import StudentProfileHeader from "./components/StudentProfileHeader.vue";
import { usePaymentsStore } from "../../stores/payments.store";
import { useStudentTabsStore } from "../../stores/studentTabs.store";

const route = useRoute();
const router = useRouter();
const payments = usePaymentsStore();
const st = useStudentTabsStore();

async function loadData() {
  const studentId = route.params.id as string;
  if (studentId) {
    payments.reset();
    st.resetAll();
    await payments.loadStudent(studentId);
    //await st.loadStudent(studentId);
  }
}

onMounted(loadData);

watch(
  () => route.params.id,
  (newId) => {
    if (newId) loadData();
  }
);

function closeProfile() {
  router.push({ name: 'students-list' });
}
</script>

<style scoped>
.student-profile-wrapper {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: 100;
  display: flex;
  pointer-events: none; /* Let clicks pass through except on overlay/panel */
}

.sp-overlay {
  pointer-events: auto;
}

.student-panel {
  pointer-events: auto;
}
</style>
