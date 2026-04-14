import { http } from './http'
import { TEACHERS } from './endpoints'

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
  personalEmail?: string | null
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
  const res = await http.get(TEACHERS.LIST, { params })
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
  pesel?: string | null
  idCard?: string | null
  languages?: string[]
  personalEmail?: string | null
}

export interface TeacherCreatePayload {
  email: string         // login email
  personalEmail: string // personal email
  password: string      // account password
  firstName: string
  lastName: string
  phone: string
  country: string
  voivodeship: string    // region
  city: string
  postCode: string
  street: string
  apt: string
  birthDate?: string | null
  pesel?: string | null
  idCard?: string | null
  languages?: string[]
  comment?: string | null
  availability?: string[] // days of the week, e.g. ['monday', 'tuesday']
}

export async function getTeacher(id: number): Promise<TeacherDetails> {
  const res = await http.get(TEACHERS.BY_ID(id))
  return res.data as TeacherDetails
}

export async function createTeacher(payload: TeacherCreatePayload): Promise<TeacherDetails> {
  const res = await http.post(TEACHERS.CREATE, payload)
  return res.data as TeacherDetails
}

export async function updateTeacher(id: number, payload: Partial<TeacherDetails>): Promise<TeacherDetails> {
  const res = await http.put(TEACHERS.BY_ID(id), payload)
  return res.data as TeacherDetails
}

export async function changeTeacherPassword(id: number, password: string): Promise<void> {
  await http.post(TEACHERS.PASSWORD(id), { password })
}

export interface TeacherHistoryItem {
  id: number
  action: string
  changes?: Record<string, any>
  userName: string
  createdAt: string
}

export interface TeacherGroupItem {
  id: number
  name: string
  schedule: string
  status: string
  startDate: string | null
  studentsCount: number
  school: string
  age?: string | null
}

export interface TeacherNote {
  id: number
  userId: number | null
  userName: string
  text: string
  createdAt: string
  updatedAt?: string
}

function normalizeTeacherNote(raw: any): TeacherNote {
  return {
    id: Number(raw?.id ?? 0),
    userId: raw?.userId ?? raw?.createdBy ?? null,
    userName: String(raw?.userName ?? raw?.who ?? 'System'),
    text: String(raw?.text ?? ''),
    createdAt: String(raw?.createdAt ?? ''),
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : undefined,
  }
}

function normalizeTeacherGroup(raw: any): TeacherGroupItem {
  const status = String(raw?.status ?? raw?.status_group ?? '')

  return {
    id: Number(raw?.id ?? 0),
    name: String(raw?.name ?? raw?.group_name ?? raw?.title ?? 'Unknown Group'),
    schedule: String(raw?.schedule ?? raw?.description ?? ''),
    status,
    startDate: raw?.startDate ?? raw?.start_date ?? null,
    studentsCount: Number(raw?.studentsCount ?? raw?.students_count ?? raw?.count ?? 0),
    school: String(raw?.school ?? raw?.branch ?? 'Space Memory'),
    age: raw?.age_name ?? raw?.age ?? null
  }
}

export async function getTeacherHistory(id: number): Promise<TeacherHistoryItem[]> {
  const res = await http.get(TEACHERS.HISTORY(id))
  return res.data as TeacherHistoryItem[]
}

export async function getTeacherGroups(id: number): Promise<TeacherGroupItem[]> {
  const res = await http.get(TEACHERS.GROUPS(id))
  // Handle wrapped collections (data, items, groups) or direct arrays
  const payload = res.data?.data ?? res.data?.items ?? res.data?.groups ?? res.data ?? []
  if (!Array.isArray(payload)) return []
  return payload.map((item: any) => normalizeTeacherGroup(item))
}

export async function getTeacherNotes(id: number): Promise<TeacherNote[]> {
  const res = await http.get(TEACHERS.NOTES(id))
  const payload = res.data?.items ?? res.data ?? []
  if (!Array.isArray(payload)) return []
  return payload.map((item: any) => normalizeTeacherNote(item))
}

export async function addTeacherNote(id: number, text: string): Promise<TeacherNote> {
  const res = await http.post(TEACHERS.NOTES(id), { text })
  return normalizeTeacherNote(res.data?.note ?? res.data)
}

export async function updateTeacherNote(id: number, noteId: number, text: string): Promise<TeacherNote> {
  const res = await http.patch(`${TEACHERS.NOTES(id)}/${noteId}`, { text })
  return normalizeTeacherNote(res.data?.note ?? res.data)
}

export async function deleteTeacherNote(id: number, noteId: number): Promise<void> {
  await http.delete(`${TEACHERS.NOTES(id)}/${noteId}`)
}
