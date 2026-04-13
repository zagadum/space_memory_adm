import { http } from './http'
import { ACTIVITY } from './endpoints'
import type { ActivityLog, ActivityListParams, ActivityListResponse } from '../stores/activity.store'

export async function getRecentActivity(limit = 10): Promise<ActivityLog[]> {
  const res = await http.get<ActivityLog[]>(ACTIVITY.RECENT, { params: { limit } })
  return res.data
}

export async function getActivityList(params: ActivityListParams): Promise<ActivityListResponse> {
  const res = await http.get<ActivityListResponse>(ACTIVITY.LIST, { params })
  return res.data
}

export async function getStudentActivity(id: number | string): Promise<ActivityLog[]> {
  const res = await http.get<ActivityLog[]>(ACTIVITY.STUDENT(id))
  return res.data
}

export async function getGroupActivity(id: number | string): Promise<ActivityLog[]> {
  const res = await http.get<ActivityLog[]>(ACTIVITY.GROUP(id))
  return res.data
}
