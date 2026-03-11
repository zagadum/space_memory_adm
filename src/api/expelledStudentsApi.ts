import { http } from "./http";

export interface ExpelledHistoryItem {
  event: string;
  date: string;
  detail: string;
  color: string;
}

export interface ExpelledStudent {
  id: number;
  name: string;
  phone: string;
  group: string;
  type: 'group' | 'individual';
  paid: boolean;
  expelled: string;           // YYYY-MM-DD
  lastContact: string | null;
  manager: string;
  comment: string;
  history: ExpelledHistoryItem[];
}

export interface ExpelledStats {
  total: number;
  hot: number;      // без контакта > 7 дней или lastContact === null
  none: number;     // lastContact === null
  unpaid: number;   // paid === false
}

export interface ExpelledListResponse {
  data: ExpelledStudent[];
  meta: ExpelledStats;
}

export interface ExpelledUpdatePayload {
  lastContact?: string | null;
  manager?: string;
  comment?: string;
}

export const expelledStudentsApi = {
  async getList(projectId = 1): Promise<ExpelledListResponse> {
    const { data } = await http.get<ExpelledListResponse>('expelled-students', {
      params: { project_id: projectId },
    });
    return data;
  },

  async update(id: number, payload: ExpelledUpdatePayload): Promise<{ id: number; updatedAt: string }> {
    const { data } = await http.patch<{ id: number; updatedAt: string }>(
      `expelled-students/${id}`,
      payload
    );
    return data;
  },

  async archive(id: number, reason: string): Promise<{ id: number; archivedAt: string }> {
    const { data } = await http.post<{ id: number; archivedAt: string }>(
      `expelled-students/${id}/archive`,
      { reason }
    );
    return data;
  },

  async transfer(id: number, groupId: number): Promise<{ id: number; newGroup: string }> {
    const { data } = await http.post<{ id: number; newGroup: string }>(
      `expelled-students/${id}/transfer`,
      { group_id: groupId }
    );
    return data;
  },

  async bulkAssign(ids: number[], manager: string): Promise<{ updated: number }> {
    const { data } = await http.post<{ updated: number }>(
      'expelled-students/bulk-assign',
      { ids, manager }
    );
    return data;
  },

  async bulkArchive(ids: number[], reason: string): Promise<{ archived: number }> {
    const { data } = await http.post<{ archived: number }>(
      'expelled-students/bulk-archive',
      { ids, reason }
    );
    return data;
  },
};
