<template>
  <BaseModal popupClass="popup-unlock">
    <div class="popup-title">🔓 Разблокировать платформу</div>
    <div class="popup-sub" style="margin-bottom: 20px;">Временный доступ при отсутствии платежа.</div>

    <label class="popup-label">Причина</label>
    <select class="popup-input" v-model="form.reasonCode">
      <option value="agreed">Согласованный срок</option>
      <option value="waiting">Ожидание платежа</option>
      <option value="admin">Решение администратора</option>
    </select>

    <label class="popup-label">Обоснование</label>
    <input 
      type="text" 
      class="popup-input" 
      v-model="form.justification" 
      placeholder="напр. Родитель подтвердил перевод на завтра..."
    >

    <div class="popup-2col">
      <div>
        <label class="popup-label">Od</label>
        <input type="date" class="popup-input" v-model="form.dateFrom" style="margin-bottom: 0">
      </div>
      <div>
        <label class="popup-label">Do</label>
        <input type="date" class="popup-input" v-model="form.dateTo" style="margin-bottom: 0">
      </div>
    </div>

    <label class="popup-label" style="margin-top: 12px">Ответственный</label>
    <select class="popup-input" v-model="form.responsibleId">
      <option v-for="staff in staffList" :key="staff.id" :value="staff.id">
        {{ staff.name }} ({{ staff.role }})
      </option>
    </select>

    <div class="popup-actions" style="margin-top: 24px;">
      <button class="btn btn-ghost" @click="close">Отмена</button>
      <button class="btn btn-unlock" :disabled="saving" @click="confirm">🔓 Разблокировать</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseModal from "../BaseModal.vue";
import { useModalStore } from "../../stores/modal.store";
import { useAuthStore } from "../../stores/auth.store";
import { paymentsApi } from "../../api/paymentsApi";

const modal = useModalStore();
const auth = useAuthStore(); // Стор текущего пользователя

const programId = modal.payload?.programId as string | undefined;
const saving = ref(false);

// 1. Имитация справочника сотрудников (в будущем это будет запрос GET /api/staff)
const staffList = ref([
  { id: "u_101", name: "Артём", role: "Отдел продаж" },
  { id: "u_102", name: "Magda Wiśniewska", role: "Менеджер" },
  { id: "u_103", name: "Tomasz Adamski", role: "Администратор" }
]);

// 2. Структура данных (DTO), которая полетит на бэкенд
const form = ref({
  reasonCode: "agreed", // Передаем системный код, а не текст
  justification: "",
  dateFrom: "",
  dateTo: "",
  responsibleId: ""     // Передаем ID сотрудника
});

onMounted(() => {
  // 3. Умная логика: при открытии модалки автоматически ставим ответственным текущего юзера
  // В реальном приложении мы бы взяли ID из auth.user.id
  form.value.responsibleId = "u_101"; // Подставляем ID Артёма по умолчанию
});

function close() { 
  modal.close(); 
}

async function confirm() {
  if (!programId) return close();
  
  saving.value = true;
  try {
    // 4. Формируем чистый и красивый Payload для бэкендера
    const payload = {
      programId: programId,
      reasonCode: form.value.reasonCode,
      justification: form.value.justification.trim(),
      dateFrom: form.value.dateFrom,
      dateTo: form.value.dateTo,
      responsibleUserId: form.value.responsibleId
    };

    // Выводим в консоль, чтобы бэкендер видел, какие данные мы отправляем
    console.log("🚀 [API REQUEST] POST /api/v1/payments/unlock", payload);

    // Временно оставляем вызов старого мока, чтобы проект не упал с ошибкой
    await paymentsApi.unlock({ programId }); 
    
    // В будущем это будет так:
    // await paymentsApi.unlock(payload);

    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.btn-unlock {
  background: rgba(6, 182, 212, 0.08);
  color: var(--cyan, #06b6d4);
  border: 1px solid rgba(6, 182, 212, 0.22);
}
.btn-unlock:hover:not(:disabled) {
  background: rgba(6, 182, 212, 0.15);
}
</style>