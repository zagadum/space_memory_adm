import { getRecruitmentHttpClient, type RecruitmentBackend } from "./http";

export interface ImportDbItem {
  id: number | string;
  surname: string;
  first_name: string;
  parent_email: string;
  phone: string;
  nickname?: string;
  subscription_amount: number | string;
  contract_old_new: string;
  balance_overpayment: number | string;
  discount: number | string;
  is_send: boolean | number;
  is_done: boolean | number;
}

export interface ImportDbPagination {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
}

export interface ImportDbListResponse {
  items: ImportDbItem[];
  pagination: ImportDbPagination;
}

function pickItems(payload: any): ImportDbItem[] {
  if (Array.isArray(payload)) return payload as ImportDbItem[];
  if (Array.isArray(payload?.items)) return payload.items as ImportDbItem[];
  if (Array.isArray(payload?.data)) return payload.data as ImportDbItem[];
  if (Array.isArray(payload?.data?.data)) return payload.data.data as ImportDbItem[];
  return [];
}

function pickPagination(payload: any, itemCount: number): ImportDbPagination {
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

function createImportDbApi(backend: RecruitmentBackend = "default") {
  const client = getRecruitmentHttpClient(backend);

  return {
    async getImportDbList(params: { page?: number; perPage?: number } = {}): Promise<ImportDbListResponse> {
      const { data } = await client.get("recruitment/import-db", {
        params: {
          page: params.page ?? 1,
          per_page: params.perPage ?? 10,
        },
      });
      const items = pickItems(data);
      return {
        items,
        pagination: pickPagination(data, items.length),
      };
    },

    async deleteImportDbItem(id: number | string) {
      const { data } = await client.delete(`recruitment/import-db/${id}`);
      return data;
    },

    async resendInvitation(id: number | string) {
      const { data } = await client.post(`recruitment/import-db/${id}/resend-invitation`);
      return data;
    },

    async updateImportDbItem(id: number | string, payload: Partial<ImportDbItem>) {
      const { data } = await client.patch(`recruitment/import-db/${id}`, payload);
      return data;
    },
  };
}

export const importDbApi = createImportDbApi();

export function getImportDbApi(backend: RecruitmentBackend = "default") {
  return createImportDbApi(backend);
}

