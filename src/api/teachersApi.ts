import { http } from './http'

export interface TeacherListParams {
  search?: string
  page?: number
  per_page?: number
  city?: string | null
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export interface TeacherListItem {
  id: number
  firstName: string
  lastName: string
  phone: string
  email: string
  groupLessonsCount: number
  individualLessonsCount: number
  city: string
  comment: string | null
}

export interface TeacherListResponse {
  data: TeacherListItem[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}

export async function getTeachers(params: TeacherListParams = {}): Promise<TeacherListResponse> {
  const res = await http.get('teachers', { params })
  return res.data as TeacherListResponse
}
