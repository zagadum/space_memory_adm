import { defineStore } from "pinia";
import {
    getStudents,
    getStudentGroupsFilter,
    getStudentTeacherFilter,
    type StudentListParams,
} from "../api/studentApi";

export interface Student {
    id: number | string;
    name: string;
    firstName: string;
    lastName: string;
    phone?: string;
    startDate?: string;
    daysInSystem?: number;
    enrollments?: StudentEnrollment[];
    groupColor?: string;
    lastContact?: string;
    daysSinceContact?: number;
    staff?: string;
    staffInitials?: string;
    avatarColor?: string;
    comment?: string;
    paid?: boolean;
}

export interface StudentEnrollment {
    school: string;
    group: string;
    teacher: string;
    groupId?: number | null;
}

export interface SelectOption {
    id: number;
    name: string;
}

export const useStudentsListStore = defineStore("studentsList", {
    state: () => ({
        students: [] as Student[],
        groupsFilterOptions: [] as SelectOption[],
        teachersFilterOptions: [] as SelectOption[],
        pagination: {
            currentPage: 1,
            lastPage: 1,
            perPage: 20,
            total: 0,
            from: 0,
            to: 0,
        },
        filters: {
            search: "",
            groupId: null as number | null,
            teacherId: null as number | null,
            withoutContact7Plus: false,
            onlyMine: false,
        },
        sorting: {
            orderBy: "full_name",
            orderDirection: "asc" as "asc" | "desc",
        },
        loading: false,
        error: ""
    }),
    getters: {
        totalStudents: (state) => state.pagination.total || state.students.length
    },
    actions: {
        async fetchStudents(page?: number) {
            this.loading = true;
            this.error = "";
            try {
                const params: StudentListParams = {
                    page: page ?? this.pagination.currentPage,
                    per_page: this.pagination.perPage,
                    search: this.filters.search || undefined,
                    group_id: this.filters.groupId,
                    teacher_id: this.filters.teacherId,
                    without_contact_7_plus: this.filters.withoutContact7Plus,
                    only_mine: this.filters.onlyMine,
                    orderBy: this.sorting.orderBy,
                    orderDirection: this.sorting.orderDirection,
                };

                const result = await getStudents(params);
                // Unwrap the standardized pagination structure: { data: [...], meta: ... }
                const items = result.data || [];
                
                this.students = items.map((u: any) => {
                    return {
                        id: u.id,
                        name: u.name || "Unknown Student",
                        firstName: u.firstName || "",
                        lastName: u.lastName || "",
                        phone: u.phone || u.phone_number || "-",
                        email: u.email || "",
                        startDate: u.startDate || u.created_at || "-",
                        daysInSystem: u.trainingTermDays || u.training_term_days || 0,
                        enrollments: u.enrollments?.length
                            ? u.enrollments.map((en: any) => ({
                                school: en.school || "Space Memory",
                                group: en.group || "-",
                                teacher: en.teacher || "-",
                                groupId: Number(en.groupId ?? en.group_id ?? u.groupId ?? 0) || null,
                            }))
                            : u.groups?.map((g: any) => ({
                                school: g.school_name || "Space Memory",
                                group: g.name || "-",
                                teacher: g.teacher_name || "-",
                                groupId: Number(g.id ?? g.group_id ?? u.groupId ?? 0) || null,
                            })) || [],
                        lastContact: u.lastContact || u.last_contact_at || null,
                        daysSinceContact: u.daysSinceContact || u.days_since_last_contact || null,
                        staff: u.staff || u.manager_name || "-",
                        staffInitials: u.staffInitials || u.manager_initials || "-",
                        comment: u.comment || u.last_comment || "",
                        paid: u.paid ?? !!u.is_paid
                    };
                });
                this.pagination.currentPage = result.meta?.current_page || 1;
                this.pagination.lastPage = result.meta?.last_page || 1;
                this.pagination.perPage = result.meta?.per_page || this.pagination.perPage;
                this.pagination.total = result.meta?.total || items.length;
                this.pagination.from = result.meta?.from || 0;
                this.pagination.to = result.meta?.to || 0;
            } catch (e: any) {
                this.error = "Failed to fetch students";
                console.error(e);
            } finally {
                this.loading = false;
            }
        },

        async fetchFilterOptions() {
            try {
                const commonParams = {
                    search: this.filters.search || undefined,
                    without_contact_7_plus: this.filters.withoutContact7Plus,
                    only_mine: this.filters.onlyMine,
                };

                const [groupsRes, teachersRes] = await Promise.all([
                    getStudentGroupsFilter(commonParams),
                    getStudentTeacherFilter(commonParams),
                ]);

                this.groupsFilterOptions = groupsRes.items || [];
                this.teachersFilterOptions = teachersRes.items || [];
            } catch (e) {
                console.error("Failed to load list filter options", e);
            }
        },

        async applyFilters() {
            this.pagination.currentPage = 1;
            await Promise.all([this.fetchStudents(1), this.fetchFilterOptions()]);
        },

        async setPage(page: number) {
            if (page < 1 || page > this.pagination.lastPage || page === this.pagination.currentPage) {
                return;
            }
            await this.fetchStudents(page);
        },

        setSort(orderBy: string, orderDirection: "asc" | "desc") {
            this.sorting.orderBy = orderBy;
            this.sorting.orderDirection = orderDirection;
        }
    }
});