import { http } from "./http";
import { DashboardStats } from "../stores/dashboard.store";

export const DASHBOARD_STATS_ENDPOINT = "/v1/dashboard/stats";

export async function getDashboardStats() {
    const res = await http.get<DashboardStats>(DASHBOARD_STATS_ENDPOINT);
    return res.data;
}
