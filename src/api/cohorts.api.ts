import { http } from './http';

export interface CohortHeatmapItem {
  month_index: number;
  month_label: string;
  paid_count: number;
  percentage: number;
}

export interface CohortItem {
  cohort: string;
  total_students: number;
  heatmap: CohortHeatmapItem[];
}

export interface CohortStatsResponse {
  year: number;
  data: CohortItem[];
}

export const cohortsApi = {
  getStats(params: { project_id?: number; year?: number } = {}): Promise<CohortStatsResponse> {
    return http.get('/v1/finance/cohorts', { params });
  }
};
