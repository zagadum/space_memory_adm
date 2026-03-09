<template>
  <div v-if="modalStore.activeModal === 'attendance'" class="popup-overlay active">
    <div class="popup-bd" @click="modalStore.closeModal()"></div>
    <div class="popup-content">
      <div class="popup-close" @click="modalStore.closeModal()">✕</div>
      
      <div class="p-att-title">Явка · Занятие #{{ modalData?.lessonNum }}</div>
      <div class="p-att-subtitle">{{ modalData?.date }} · {{ modalData?.schoolName }}</div>
      
      <div class="p-att-options">
        <div class="p-att-opt" :class="{ active: tempAttendance === 'Присутствовал' }" @click="tempAttendance = 'Присутствовал'">
          <div class="p-att-icon att-ok">✓</div>
          <div class="p-att-label">Присутствовал</div>
        </div>
        <div class="p-att-opt" :class="{ active: tempAttendance === 'Отсутствовал' }" @click="tempAttendance = 'Отсутствовал'">
          <div class="p-att-icon att-no">✕</div>
          <div class="p-att-label">Отсутствовал</div>
        </div>
      </div>

      <div class="p-att-history">
        <div class="p-att-hist-title">История изменений</div>
        <div v-for="h in modalData?.history" :key="h.date" class="p-att-hist-item">
          <div class="p-att-hist-meta">{{ h.author }} · {{ h.date }}</div>
          <div class="p-att-hist-val">Отмечено: {{ h.action }}</div>
        </div>
      </div>

      <button class="p-att-save" @click="saveAttendance">💾 Сохранить</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useModalStore } from '../../stores/modal.store';
import { useStudentTabsStore } from '../../stores/studentTabs.store';
import { storeToRefs } from 'pinia';

const modalStore = useModalStore();
const studentTabsStore = useStudentTabsStore();
const { modalData } = storeToRefs(modalStore);
const tempAttendance = ref('');

// Следим за открытием, чтобы подставить текущее значение
watch(() => modalStore.activeModal, (newVal) => {
  if (newVal === 'attendance') {
    tempAttendance.value = modalData.value?.currentAttendance || '';
  }
});

const saveAttendance = () => {
  const { enrollmentId, lessonId } = modalData.value;
  
  // Находим ученика и нужный enrollment
  if (studentTabsStore.student) {
    const enrollment = studentTabsStore.student.enrollments.find((e: any) => e.school === enrollmentId);
    if (enrollment) {
      const lesson = enrollment.lessons.find((l: any) => l.id === lessonId);
      if (lesson) {
        // Обновляем статус
        lesson.attendance = tempAttendance.value;
        // Можно добавить запись в историю, если нужно
      }
    }
  }
  
  modalStore.closeModal();
};
</script>

<style scoped>
.popup-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: .2s; }
.popup-overlay.active { opacity: 1; pointer-events: all; }
.popup-bd { position: absolute; inset: 0; background: rgba(4,4,15,0.85); backdrop-filter: blur(5px); }
.popup-content { position: relative; width: 100%; max-width: 340px; background: #0c0c28; border: 1px solid rgba(100,120,255,0.3); border-radius: 20px; padding: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
.popup-close { position: absolute; top: 16px; right: 16px; color: #8892b0; cursor: pointer; font-size: 18px; z-index: 10; }

.p-att-title { font-size: 18px; font-weight: 700; color: #e8eeff; text-align: center; }
.p-att-subtitle { font-size: 13px; color: #8892b0; text-align: center; margin-top: 4px; margin-bottom: 24px; }
.p-att-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.p-att-opt { background: rgba(255,255,255,0.03); border: 1px solid rgba(100,120,255,0.15); border-radius: 14px; padding: 16px; text-align: center; cursor: pointer; transition: .2s; }
.p-att-opt.active { background: rgba(79,110,247,0.1); border-color: #4f6ef7; box-shadow: 0 0 15px rgba(79,110,247,0.2); }
.p-att-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 18px; }
.p-att-label { font-size: 13px; font-weight: 600; color: #e8eeff; }
.att-ok { background: rgba(16,185,129,0.1); color: #10b981; }
.att-no { background: rgba(239,68,68,0.1); color: #ef4444; }

.p-att-history { margin-bottom: 24px; }
.p-att-hist-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #8892b0; margin-bottom: 12px; }
.p-att-hist-item { padding: 8px 0; border-bottom: 1px solid rgba(100,120,255,0.1); }
.p-att-hist-meta { font-size: 11px; color: #8892b0; margin-bottom: 2px; }
.p-att-hist-val { font-size: 12px; color: #e8eeff; }

.p-att-save { width: 100%; padding: 14px; background: linear-gradient(135deg, #4f6ef7, #8b5cf6); border: none; border-radius: 12px; color: white; font-weight: 700; cursor: pointer; transition: .2s; }
.p-att-save:hover { filter: brightness(1.1); transform: translateY(-1px); }
</style>
