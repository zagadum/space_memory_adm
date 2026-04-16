import { defineStore } from "pinia";
import {
  getStudentGroups,
  getStudentInfo,
  getStudentAttendance,
  getStudentProgress,
  getStudentNotes,
} from "../api/studentApi";

import type { StudentProfile } from "../api/mockDb";

import { ref, reactive } from "vue";
import { parseApiError } from "../api/errorHelper";

export const useStudentTabsStore = defineStore("studentTabs", () => {
  // ── State ──
  const loading = reactive({
    groups: false,
    info: false,
    attendance: false,
    progress: false,
    notes: false,
  });

  const groups = ref<any[]>([]);
  const info = ref<any>(null);
  const attendance = ref<any>(null);
  const progress = ref<any>(null);
  const notes = ref<any[]>([]);
  const student = ref<StudentProfile | null>(null);

  // ── Actions ──
  async function loadGroups(studentId: string) {
    loading.groups = true;
    try {
      const res = await getStudentGroups(studentId);
      groups.value = res.items || [];
    } catch (e: unknown) {
      console.error("Failed to load groups:", parseApiError(e));
    } finally {
      loading.groups = false;
    }
  }

  async function loadInfo(studentId: string) {
    loading.info = true;
    try {
      const res = await getStudentInfo(studentId);
      info.value = res.info;
    } catch (e: unknown) {
      console.error("Failed to load info:", parseApiError(e));
    } finally {
      loading.info = false;
    }
  }

  async function loadAttendance(studentId: string) {
    loading.attendance = true;
    try {
      const res = await getStudentAttendance(studentId);
      attendance.value = res.attendance;
    } catch (e: unknown) {
      console.error("Failed to load attendance:", parseApiError(e));
    } finally {
      loading.attendance = false;
    }
  }

  function updateAttendanceRow(updatedRow: any) {
    if (!updatedRow?.id || !attendance.value || !Array.isArray(attendance.value.items)) return;

    const items = [...attendance.value.items];
    const index = items.findIndex((item) => String(item?.id) === String(updatedRow.id));
    if (index === -1) return;

    items[index] = { ...items[index], ...updatedRow };

    const present = items.filter((item) => item?.mark === "present").length;
    const absent = items.filter((item) => item?.mark === "absent").length;
    const makeup = items.filter((item) => item?.mark === "makeup").length;
    const late = items.filter((item) => item?.mark === "late").length;
    const total = items.length;
    const rate = total > 0 ? Number((((present + late) / total) * 100).toFixed(1)) : 0;

    attendance.value = {
      ...attendance.value,
      items,
      summary: {
        ...(attendance.value.summary || {}),
        total,
        present,
        absent,
        makeup,
        late,
        rate,
      },
    };
  }

  async function loadProgress(studentId: string) {
    loading.progress = true;
    try {
      const res = await getStudentProgress(studentId);
      progress.value = res.progress;
    } catch (e: unknown) {
      console.error("Failed to load progress:", parseApiError(e));
    } finally {
      loading.progress = false;
    }
  }

  async function loadNotes(studentId: string) {
    loading.notes = true;
    try {
      const res = await getStudentNotes(studentId);
      notes.value = res.items || [];
    } catch (e: unknown) {
      console.error("Failed to load notes:", parseApiError(e));
    } finally {
      loading.notes = false;
    }
  }

  function resetAll() {
    groups.value = [];
    info.value = null;
    attendance.value = null;
    progress.value = null;
    notes.value = [];
  }

  return {
    loading,
    groups,
    info,
    attendance,
    progress,
    notes,
    student,
    loadGroups,
    loadInfo,
    loadAttendance,
    updateAttendanceRow,
    loadProgress,
    loadNotes,
    resetAll,
  };
});
