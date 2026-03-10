import { http } from "./http";
import type { SalaryData } from "../stores/teacherSalary.store";

export const salaryApi = {
  async getTeacherSalary(teacherId: number, month: string, projectId = 1): Promise<SalaryData> {
    const { data } = await http.get<SalaryData>(`salary/teacher/${teacherId}`, {
      params: { month, project_id: projectId },
    });
    return data;
  },

  async confirmSalary(salaryId: string | number, projectId = 1): Promise<{ id: number; status: string; confirmedAt: string | null }> {
    const { data } = await http.post<{ id: number; status: string; confirmedAt: string | null }>(`salary/${salaryId}/confirm`, {
      project_id: projectId,
    });
    return data;
  },

  async disputeSalary(
    salaryId: string | number,
    teacherId: number,
    reason: string,
    projectId = 1
  ): Promise<{ id: number; salary_calculation_id: number; status: string }> {
    const { data } = await http.post<{ id: number; salary_calculation_id: number; status: string }>(`salary/${salaryId}/dispute`, {
      project_id: projectId,
      teacher_id: teacherId,
      reason,
    });
    return data;
  },
};

