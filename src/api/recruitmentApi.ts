import { httpRecruitment } from "./http";

export interface RecruitmentNewStudent {
  id: number;
  name: string;
  age: number;
  contract: "signed" | "pending";
  payment?: number;
  paymentStr?: string;
  group?: string | null;
  groupColor?: string | null;
  startDate?: string | null;
  createdDate?: string;
  waitDays?: number;
  manager?: string | null;
}

export interface RecruitmentLead {
  id: string;
  name: string;
  phone: string;
  subject: string;
  createdAt: string;
  status: "new" | "in_progress" | "trial" | "decision";
}

function pickItems<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.items)) return payload.items as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  return [];
}

export const recruitmentApi = {
  async getNewStudents(): Promise<RecruitmentNewStudent[]> {
    const { data } = await httpRecruitment.get("recruitment/new-students");
    return pickItems<RecruitmentNewStudent>(data);
  },

  async createNewStudent(payload: {
    name: string;
    age: number;
    manager: string | null;
    startDate: string | null;
  }) {
    const { data } = await httpRecruitment.post("recruitment/new-students", payload);
    return data;
  },

  async archiveNewStudent(studentId: number) {
    const { data } = await httpRecruitment.post(`recruitment/new-students/${studentId}/archive`);
    return data;
  },

  async getLeads(): Promise<RecruitmentLead[]> {
    const { data } = await httpRecruitment.get("recruitment/leads");
    return pickItems<RecruitmentLead>(data);
  },

  async updateLeadStatus(leadId: string, status: RecruitmentLead["status"]) {
    const { data } = await httpRecruitment.patch(`recruitment/leads/${leadId}`, { status });
    return data;
  },

  async createLead(payload: Omit<RecruitmentLead, "id">) {
    const { data } = await httpRecruitment.post("recruitment/leads", payload);
    return data;
  },
};

