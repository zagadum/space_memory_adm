import { http } from "./http";
import { PerformanceMetrics } from "../stores/performanceMetrics.store";

export const PERFORMANCE_METRICS_ENDPOINT = "/analytics/performance";

export async function getPerformanceMetrics(period: string = '7d') {
    const res = await http.get<PerformanceMetrics>(PERFORMANCE_METRICS_ENDPOINT, { params: { period } });
    return res.data;
}
