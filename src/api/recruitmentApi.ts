import { getRecruitmentHttpClient, type RecruitmentBackend } from "./http";

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

export interface RecruitmentDocumentItem {
  id: number | string;
  name: string;
  signed: boolean;
}

export interface RecruitmentTransactionItem {
  id: number | string;
  date: string;
  amount: number;
  currency: string;
  status: string;
}

export interface RecruitmentStudentPayments {
  currentPrice: string;
  currentPriceDesc: string;
  documentList: RecruitmentDocumentItem[];
  transactionList: RecruitmentTransactionItem[];
}

function pickStudentPayments(payload: any): RecruitmentStudentPayments {
  const source = payload?.data?.data && !Array.isArray(payload?.data)
    ? payload.data
    : (payload?.data ?? payload ?? {});

  const currentPriceRaw = source?.currentPrice ?? source?.current_price ?? source?.price ?? '0.00';
  const currentPriceDesc = String(source?.currentPriceDesc ?? source?.current_price_desc ?? source?.price_desc ?? 'Не выбран');
  const documentListRaw = source?.documentList ?? source?.document_list ?? [];
  const transactionListRaw = source?.transactionList ?? source?.transaction_list ?? [];

  const documentList: RecruitmentDocumentItem[] = Array.isArray(documentListRaw)
    ? documentListRaw.map((d: any, idx: number) => ({
        id: d?.id ?? idx,
        name: String(d?.name ?? d?.title ?? d?.document_name ?? 'Документ'),
        signed: Boolean(d?.signed ?? d?.is_signed ?? d?.status === 'signed'),
      }))
    : [];

  const transactionList: RecruitmentTransactionItem[] = Array.isArray(transactionListRaw)
    ? transactionListRaw.map((tx: any, idx: number) => ({
        id: tx?.id ?? idx,
        date: String(tx?.date ?? tx?.created_at ?? tx?.transaction_date ?? ''),
        amount: Number(tx?.amount ?? tx?.value ?? 0) || 0,
        currency: String(tx?.currency ?? 'PLN'),
        status: String(tx?.status ?? 'pending'),
      }))
    : [];

  return {
    currentPrice: String(currentPriceRaw),
    currentPriceDesc,
    documentList,
    transactionList,
  };
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

function createRecruitmentApi(backend: RecruitmentBackend = "default") {
  const client = getRecruitmentHttpClient(backend);

  return {
  async getNewStudents(params: { page?: number; perPage?: number } = {}): Promise<RecruitmentListResponse<RecruitmentNewStudent>> {
    const { data } = await client.get("recruitment/new-students", {
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
    const { data } = await client.post("recruitment/new-students", payload);
    return data;
  },

  async getStudentById(id: number | string) {
    const { data } = await client.get(`recruitment/new-students/${id}`);
    return data;
  },

  async getStudentHistory(id: number | string) {
    const { data } = await client.get(`recruitment/new-students/${id}/history`);
    return data;
  },

  async getStudentPayments(id: number | string): Promise<RecruitmentStudentPayments> {
    const { data } = await client.get(`recruitment/new-students/${id}/payments`);
    return pickStudentPayments(data);
  },
  
  async updateStudent(id: number | string, payload: any) {
    const { data } = await client.patch(`recruitment/new-students/${id}`, payload);
    return data;
  },

  async archiveNewStudent(studentId: number) {
    const { data } = await client.post(`recruitment/new-students/${studentId}/archive`);
    return data;
  },

  async getLeads(): Promise<RecruitmentLead[]> {
    const { data } = await client.get("recruitment/leads");
    return pickItems<RecruitmentLead>(data);
  },

  async updateLeadStatus(leadId: string, status: RecruitmentLead["status"]) {
    const { data } = await client.patch(`recruitment/leads/${leadId}`, { status });
    return data;
  },

  async createLead(payload: Omit<RecruitmentLead, "id">) {
    const { data } = await client.post("recruitment/leads", payload);
    return data;
  },
  };
}

export const recruitmentApi = createRecruitmentApi();

export function getRecruitmentApi(backend: RecruitmentBackend = "default") {
  return createRecruitmentApi(backend);
}

