import { getRecruitmentHttpClient, type RecruitmentBackend } from "./http";

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
  registered: string;
  expelled: string;
  lastContact: string | null;
  manager: string;
  comment: string;
  archReason: string;
  archComment: string;
  history: ArchivedHistoryItem[];
}

export interface ArchivedStats {
  total: number;
  month: number;
  none: number;
  return: number;
}

export interface ArchivedListResponse {
  data: ArchivedStudent[];
  meta: ArchivedStats;
}

function createArchivedStudentsApi(backend: RecruitmentBackend = "default") {
  const client = getRecruitmentHttpClient(backend);

  return {
    async getList(projectId = 1): Promise<ArchivedListResponse> {
      const { data } = await client.get<ArchivedListResponse>("archived-students", {
        params: { project_id: projectId },
      });
      return data;
    },

    async returnToNew(id: number, comment?: string): Promise<{ id: number }> {
      const { data } = await client.post<{ id: number }>(
        `archived-students/${id}/return-to-new`,
        { comment }
      );
      return data;
    },

    async transfer(id: number, groupId: number): Promise<{ id: number; newGroup: string }> {
      const { data } = await client.post<{ id: number; newGroup: string }>(
        `archived-students/${id}/transfer`,
        { group_id: groupId }
      );
      return data;
    },
  };
}

export const archivedStudentsApi = createArchivedStudentsApi();

export function getArchivedStudentsApi(backend: RecruitmentBackend = "default") {
  return createArchivedStudentsApi(backend);
}
