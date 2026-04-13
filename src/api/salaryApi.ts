import { http } from "./http";
import { SALARY } from "./endpoints";
import type { SalaryData } from "../stores/teacherSalary.store";

export interface SalaryHistoryItem {
  id: number;
  salaryCalculationId?: number;
  projectId?: number;
  teacherId?: number | null;
  actorId?: number | null;
  actorRole?: string | null;
  action: string;
  comment: string | null;
  payload?: Record<string, unknown>;
  createdAt: string | null;
}

export const salaryApi = {
  /**
   * GET /api/v1/salary/teacher/{teacherId}
   * Возвращает расчёт зарплаты преподавателя за выбранный месяц.
   */
  async getTeacherSalary(
    teacherId: number | string,
    month: string,
    projectId = 1
  ): Promise<SalaryData> {
    const { data } = await http.get<SalaryData>(SALARY.TEACHER(teacherId), {
      params: { month, project_id: projectId },
    });
    return data;
  },

  async recalculateSalary(
    teacherId: number | string,
    month: string,
    projectId = 1
  ): Promise<SalaryData> {
    const { data } = await http.post<SalaryData>(
      SALARY.RECALCULATE(teacherId),
      { month, project_id: projectId }
    );
    return data;
  },

  /**
   * POST /api/v1/salary/{id}/confirm
   * Переводит расчёт в статус confirmed, записывает confirmed_at.
   */
  async confirmSalary(
    salaryId: string | number,
    projectId = 1
  ): Promise<{ id: number; status: string; confirmedAt: string | null }> {
    const { data } = await http.post<{ id: number; status: string; confirmedAt: string | null }>(
      SALARY.CONFIRM(salaryId),
      { project_id: projectId }
    );
    return data;
  },

  async markSalaryPaid(
    salaryId: string | number,
    actorId?: number,
    projectId = 1,
    comment?: string
  ): Promise<{ id: number; status: string; paidAt: string | null }> {
    const { data } = await http.post<{ id: number; status: string; paidAt: string | null }>(
      SALARY.PAID(salaryId),
      { project_id: projectId, actor_id: actorId, comment }
    );
    return data;
  },

  /**
   * POST /api/v1/salary/{id}/dispute  → 201 Created
   * Создаёт запись в gls_salary_disputes, меняет статус расчёта на disputed.
   * ВАЖНО: id в ответе — это ID спора, НЕ расчёта зарплаты.
   */
  async disputeSalary(
    salaryId: string | number,
    teacherId: number,
    reason: string,
    projectId = 1
  ): Promise<{ id: number; salary_calculation_id: number; status: string }> {
    const { data } = await http.post<{ id: number; salary_calculation_id: number; status: string }>(
      SALARY.DISPUTE(salaryId),
      { project_id: projectId, teacher_id: teacherId, reason }
    );
    return data;
  },

  async getSalaryHistory(
    salaryId: string | number,
    projectId = 1
  ): Promise<{ data: SalaryHistoryItem[] }> {
    const { data } = await http.get<{ data: SalaryHistoryItem[] }>(
      SALARY.HISTORY(salaryId),
      { params: { project_id: projectId } }
    );
    return data;
  },
};
