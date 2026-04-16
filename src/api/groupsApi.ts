import { http } from './http'

function isNotFoundError(error: any): boolean {
  return Number(error?.response?.status) === 404
}

export interface GroupListParams {
  search?: string
  page?: number
  per_page?: number
  type?: string | null          // 'group' | 'individual' | 'mini' | null
  group_id?: number | null
  teacher_id?: number | null
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export interface GroupListTeacher {
  id: number
  firstName?: string
  lastName?: string
  name?: string
}

export interface GroupListItem {
  id: number
  name: string
  type?: 'group' | 'individual' | 'mini' | string | null

  students_count?: number
  teacherId?: number
  teacher_id?: number
  teacherName?: string
  teacher?: GroupListTeacher | null
  startDate?: string
  startTime?: string | null
  start_time?: string | null
  age?: string | null
  lastComment?: string | null
  last_comment?: string | null
  lastCommentDate?: string | null
  last_comment_date?: string | null
  workday1?: number | boolean
  workday2?: number | boolean
  workday3?: number | boolean
  workday4?: number | boolean
  workday5?: number | boolean
  workday6?: number | boolean
  workday7?: number | boolean
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

export async function getGroupsTeacherFilter(params: Pick<GroupListParams, 'search'> = {}) {
  try {
    const res = await http.get('groups/teacher-filter', { params })
    return res.data as { items: Array<{ id: number; name: string }> }
  } catch (error) {
    if (!isNotFoundError(error)) throw error
  }

  try {
    const res = await http.get('students/teacher-filter', { params })
    return res.data as { items: Array<{ id: number; name: string }> }
  } catch (error) {
    if (!isNotFoundError(error)) throw error
    const fallback = await http.get('student/teacher-filter', { params })
    return fallback.data as { items: Array<{ id: number; name: string }> }
  }
}

