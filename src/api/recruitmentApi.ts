import { httpRecruitment } from "./http";

export interface RecruitmentNewStudent {
  id: number;
  name: string;
  surname?: string;
  dob?: string;
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

export interface RecruitmentPagination {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
}

export interface RecruitmentListResponse<T> {
  items: T[];
  pagination: RecruitmentPagination;
}

function pickItems<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.items)) return payload.items as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.data?.data)) return payload.data.data as T[];
  return [];
}

function pickPagination(payload: any, itemCount: number): RecruitmentPagination {
  const source = payload?.data?.data && !Array.isArray(payload?.data)
    ? payload.data
    : payload;

  const currentPage = Number(source?.current_page ?? source?.currentPage ?? 1) || 1;
  const lastPage = Number(source?.last_page ?? source?.lastPage ?? currentPage) || currentPage;
  const perPage = Number(source?.per_page ?? source?.perPage ?? itemCount ?? 0) || itemCount || 0;
  const total = Number(source?.total ?? itemCount ?? 0) || 0;
  const from = Number(source?.from ?? (itemCount ? (currentPage - 1) * (perPage || itemCount) + 1 : 0)) || 0;
  const to = Number(source?.to ?? (itemCount ? from + itemCount - 1 : 0)) || 0;

  return {
    currentPage,
    lastPage,
    perPage,
    total,
    from,
    to,
  };
}

export const recruitmentApi = {
  async getNewStudents(params: { page?: number; perPage?: number } = {}): Promise<RecruitmentListResponse<RecruitmentNewStudent>> {
    const { data } = await httpRecruitment.get("recruitment/new-students", {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
      },
    });
    const items = pickItems<RecruitmentNewStudent>(data);
    return {
      items,
      pagination: pickPagination(data, items.length),
    };
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

  async getStudentById(id: number | string) {
    const { data } = await httpRecruitment.get(`recruitment/new-students/${id}`);
    return data;
  },

  async getStudentHistory(id: number | string) {
    const { data } = await httpRecruitment.get(`recruitment/new-students/${id}/history`);
    return data;
  },
  
  async updateStudent(id: number | string, payload: any) {
    const { data } = await httpRecruitment.patch(`recruitment/new-students/${id}`, payload);
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

