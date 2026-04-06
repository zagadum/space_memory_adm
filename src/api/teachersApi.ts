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
  groupsCount?: number
  studentsCount?: number
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

export interface TeacherDetails extends TeacherListItem {
  birthDate?: string | null
  country?: string | null
  voivodeship?: string | null
  street?: string | null
  apt?: string | null
  postCode?: string | null
  passport?: string | null
}

export async function getTeacher(id: number): Promise<TeacherDetails> {
  const res = await http.get(`teachers/${id}`)
  return res.data as TeacherDetails
}

export async function updateTeacher(id: number, payload: Partial<TeacherDetails>): Promise<TeacherDetails> {
  const res = await http.put(`teachers/${id}`, payload)
  return res.data as TeacherDetails
}

export async function changeTeacherPassword(id: number, password: string): Promise<void> {
  await http.post(`teachers/${id}/change-password`, { password })
}
