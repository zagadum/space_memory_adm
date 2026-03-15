import { httpRecruitment } from "./http";

export interface ArchivedHistoryItem {
  event: string;
  date: string;
  detail: string;
  color: string;
}

export interface ArchivedStudent {
  id: number;
  name: string;
  phone: string;
  registered: string;         // YYYY-MM-DD
  expelled: string;           // YYYY-MM-DD (Archive date)
  lastContact: string | null;
  manager: string;
  comment: string;            // Previous comment
  archReason: string;         // Reason from archive modal
  archComment: string;        // Extra comment from archive modal
  history: ArchivedHistoryItem[];
}

export interface ArchivedStats {
  total: number;
  month: number;    // archived this month
  none: number;     // lastContact === null
  return: number;   // potentially returnable (reason: "Not relevant")
}

export interface ArchivedListResponse {
  data: ArchivedStudent[];
  meta: ArchivedStats;
}

export const archivedStudentsApi = {
  async getList(projectId = 1): Promise<ArchivedListResponse> {
    const { data } = await httpRecruitment.get<ArchivedListResponse>('archived-students', {
      params: { project_id: projectId },
    });
    return data;
  },

  async returnToNew(id: number, comment?: string): Promise<{ id: number }> {
    const { data } = await httpRecruitment.post<{ id: number }>(
      `archived-students/${id}/return-to-new`,
      { comment }
    );
    return data;
  },

  async transfer(id: number, groupId: number): Promise<{ id: number; newGroup: string }> {
    const { data } = await httpRecruitment.post<{ id: number; newGroup: string }>(
      `archived-students/${id}/transfer`,
      { group_id: groupId }
    );
    return data;
  },
};
