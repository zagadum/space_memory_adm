import { defineStore } from "pinia";
import { getStudents } from "../api/studentApi";

export interface Student {
    id: number | string;
    name: string;
    phone?: string;
    startDate?: string;
    daysInSystem?: number;
    enrollments?: any[];
    groupColor?: string;
    lastContact?: string;
    daysSinceContact?: number;
    staff?: string;
    staffInitials?: string;
    avatarColor?: string;
    comment?: string;
    paid?: boolean;
}

export const useStudentsListStore = defineStore("studentsList", {
    state: () => ({
        students: [] as Student[],
        loading: false,
        error: ""
    }),
    getters: {
        totalStudents: (state) => state.students.length
    },
    actions: {
        async fetchStudents() {
            this.loading = true;
            this.error = "";
            try {
                const data = await getStudents();
                // Map real API User objects to Student objects with fail-safe checks
                this.students = (data.items || []).map(u => ({
                    id: u.id,
                    name: u.name || u.full_name || u.email || "Unknown Student",
                    phone: u.phone || u.phone_number || "-",
                    startDate: u.created_at || "-",
                    daysInSystem: 0,
                    enrollments: u.groups?.map((g: any) => ({
                        school: g.school_name || "Space Memory",
                        group: g.name || "-",
                        teacher: g.teacher_name || "-"
                    })) || [],
                    staff: u.manager_name || "-",
                    paid: !!u.is_paid
                }));
            } catch (e: any) {
                this.error = "Failed to fetch students";
                console.error(e);
            } finally {
                this.loading = false;
            }
        }
    }
});