import { defineStore } from "pinia";
import {
  getStudentGroups,
  getStudentInfo,
  getStudentAttendance,
  getStudentProgress,
  getStudentNotes,
} from "../api/studentApi";

import type { StudentProfile } from "../api/mockDb";

export const useStudentTabsStore = defineStore("studentTabs", {
  state: () => ({
    loading: {
      groups: false,
      info: false,
      attendance: false,
      progress: false,
      notes: false,
    },
    groups: [] as any[],
    info: null as any,
    attendance: null as any,
    progress: null as any,
    notes: [] as any[],
    student: null as StudentProfile | null,
  }),
  actions: {
    async loadGroups(studentId: string) {
      this.loading.groups = true;
      try {
        const res = await getStudentGroups(studentId);
        this.groups = res.items || [];
      } finally {
        this.loading.groups = false;
      }
    },
    async loadInfo(studentId: string) {
      this.loading.info = true;
      try {
        const res = await getStudentInfo(studentId);
        this.info = res.info;
      } finally {
        this.loading.info = false;
      }
    },
    async loadAttendance(studentId: string) {
      this.loading.attendance = true;
      try {
        const res = await getStudentAttendance(studentId);
        this.attendance = res.attendance;
      } finally {
        this.loading.attendance = false;
      }
    },
    async loadProgress(studentId: string) {
      this.loading.progress = true;
      try {
        const res = await getStudentProgress(studentId);
        this.progress = res.progress;
      } finally {
        this.loading.progress = false;
      }
    },
    async loadNotes(studentId: string) {
      this.loading.notes = true;
      try {
        const res = await getStudentNotes(studentId);
        this.notes = res.items || [];
      } finally {
        this.loading.notes = false;
      }
    },
    // async loadStudent(studentId: string) {
    //   // try {
    //   //   const res = await studentsApi.getStudentPayments(studentId);
    //   //   this.student = res.student || null;
    //   // } catch (e) {
    //   //   console.error("Failed to load student in studentTabsStore", e);
    //   // }
    // },
    resetAll() {
      this.groups = [];
      this.info = null;
      this.attendance = null;
      this.progress = null;
      this.notes = [];
    }
  },
});
