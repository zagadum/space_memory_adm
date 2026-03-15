import { http } from './http'

export interface GroupListParams {
  search?: string
  page?: number
  per_page?: number
  type?: string | null          // 'group' | 'individual' | 'mini' | null
  teacher_id?: number | null
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export interface GroupListItem {
  id: number
  name: string
  type: 'group' | 'individual' | 'mini'
  studentsCount: number
  teacherName: string
  lastCommentDate: string | null
  lastComment: string | null
  durationDays: number
  startDate: string
}

export interface GroupListResponse {
  data: GroupListItem[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}

export async function getGroups(params: GroupListParams = {}): Promise<GroupListResponse> {
  const res = await http.get('groups', { params })
  return res.data as GroupListResponse
}
