import { getRecruitmentHttpClient, type RecruitmentBackend } from "./http";

export interface RecruitmentNewStudent {
  id: number;
  name: string;
  surname?: string;
  nickname?: string;
  nick_name?: string;
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
  phone?: string | null;
}

export interface RecruitmentLead {
  id: string;
  name: string;
  phone: string;
  subject: string;
  createdAt: string;
  status: "new" | "in_progress" | "trial" | "decision";
}

export interface RecruitmentTargetMail {
  id: number | string;
  surname: string;
  name: string;
  parent_email: string;
  status: string;
  error_message: string | null;
  link_clicked_at: string | null;
  converted_at: string | null;
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
  template?: string | null;
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
  discount?: string;
  balance_overpayment?: string;
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
        template: d?.template ?? null,
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
    discount: source?.discount != null ? String(source.discount) : undefined,
    balance_overpayment: source?.balance_overpayment != null ? String(source.balance_overpayment) : undefined,
  };
}

function pickItems<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.items)) return payload.items as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.data?.data)) return payload.data.data as T[];
  return [];
}

function pickTargetMailItems(payload: any): RecruitmentTargetMail[] {
  return pickItems<any>(payload).map((item, index) => ({
    id: item?.id ?? `${item?.surname ?? 'target-mail'}-${item?.name ?? index}`,
    surname: String(item?.surname ?? item?.last_name ?? ''),
    name: String(item?.name ?? item?.first_name ?? ''),
    parent_email: String(item?.parent_email ?? item?.parentEmail ?? item?.email ?? ''),
    status: String(item?.status ?? 'unknown'),
    error_message: item?.error_message == null ? null : String(item.error_message),
    link_clicked_at: item?.link_clicked_at ?? item?.linkClickedAt ?? null,
    converted_at: item?.converted_at ?? item?.convertedAt ?? null,
  }));
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

  const getByAliases = async (aliases: string[]) => {
    let lastError: unknown = null;

    for (const alias of aliases) {
      try {
        return await client.get(alias);
      } catch (error: any) {
        lastError = error;
        if (error?.response?.status !== 404) throw error;
      }
    }

    throw lastError ?? new Error('TargetMail endpoint not found');
  };

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

  async changePassword(id: number | string, password: string) {
    const { data } = await client.post(`recruitment/new-students/${id}/change-password`, { password });
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

  async getTargetMail(): Promise<RecruitmentTargetMail[]> {
    const { data } = await getByAliases([
      'recruitment/target-mail',
      'recruitment/targetmail',
      'target-mail',
      'targetmail',
    ]);
    return pickTargetMailItems(data);
  },

  async updateLeadStatus(leadId: string, status: RecruitmentLead["status"]) {
    const { data } = await client.patch(`recruitment/leads/${leadId}`, { status });
    return data;
  },

  async createLead(payload: Omit<RecruitmentLead, "id">) {
    const { data } = await client.post("recruitment/leads", payload);
    return data;
  },

  async downloadDocument(id: number | string, type: 'signed' | 'template' = 'signed') {
    const { data } = await client.get(`recruitment/documents/${id}/download`, {
      params: { type },
      responseType: 'blob'
    });
    return data;
  },

  async deleteDocument(id: number | string) {
    const { data } = await client.delete(`recruitment/documents/${id}`);
    return data;
  },

  async deleteAllDocuments(studentId: number | string) {
    const { data } = await client.delete(`recruitment/new-students/${studentId}/documents`);
    return data;
  },
  };
}

export const recruitmentApi = createRecruitmentApi();

export function getRecruitmentApi(backend: RecruitmentBackend = "default") {
  return createRecruitmentApi(backend);
}

