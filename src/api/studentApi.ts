import { http } from "./http";

function isNotFoundError(error: any): boolean {
  return Number(error?.response?.status) === 404;
}

export interface StudentTabsResponse<T> {
  data: T;
}

export interface StudentListParams {
  search?: string;
  page?: number;
  per_page?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  group_id?: number | null;
  teacher_id?: number | null;
  without_contact_7_plus?: boolean;
  only_mine?: boolean;
}

export interface StudentListResponse {
  data: any[];
  links?: any;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
  };
}

export async function getStudents(params: StudentListParams = {}) {
  // Map per_page to limit if backend expects 'limit', but currently store uses per_page.
  // The request said "pagination (page, limit) and search (search, filters)".
  const queryParams = {
    ...params,
    limit: params.per_page || 20,
  };
  const res = await http.get("students", { params: queryParams });
  return res.data as StudentListResponse;
}

export async function getStudentGroupsFilter(params: Pick<StudentListParams, "search" | "without_contact_7_plus" | "only_mine"> = {}) {
  try {
    const res = await http.get("students/groups-filter", { params });
    return res.data as { items: Array<{ id: number; name: string }> };
  } catch (error) {
    if (!isNotFoundError(error)) throw error;
    const fallback = await http.get("student/groups-filter", { params });
    return fallback.data as { items: Array<{ id: number; name: string }> };
  }
}

export async function getStudentTeacherFilter(params: Pick<StudentListParams, "search" | "without_contact_7_plus" | "only_mine"> = {}) {
  try {
    const res = await http.get("students/teacher-filter", { params });
    return res.data as { items: Array<{ id: number; name: string }> };
  } catch (error) {
    if (!isNotFoundError(error)) throw error;
    const fallback = await http.get("student/teacher-filter", { params });
    return fallback.data as { items: Array<{ id: number; name: string }> };
  }
}

export async function getStudentGroups(studentId: string) {
  const res = await http.get("student/groups", { params: { studentId } });
  return res.data as { items: any[] };
}

export async function changeStudentGroup(payload: {
  studentId: string;
  programId: string;
  fromGroup: string;
  toGroup: string;
  reason?: string;
}) {
  const res = await http.post("student/change-group", payload);
  return res.data as { ok: true };
}

export async function setTrainerPresence(payload: {
  studentId: string;
  groupId: string;
  trainerId: string;
  presence: string;
}) {
  const res = await http.post("student/trainer-presence", payload);
  return res.data as { ok: true };
}

export async function getStudentInfo(studentId: string) {
  const res = await http.get("student/info", { params: { studentId } });
  return res.data as { info: any };
}

export async function updateStudentInfo(payload: { studentId: string; patch: any }) {
  const res = await http.post("student/info", payload);
  return res.data as { ok: true; info: any };
}

export async function getStudentAttendance(studentId: string) {
  const res = await http.get("student/attendance", { params: { studentId } });
  return res.data as { attendance: any };
}

export async function setAttendanceMark(payload: {
  studentId: string;
  attendanceId: string;
  mark: string;
  note?: string;
}) {
  const res = await http.post("student/attendance", payload);
  return res.data as { ok: true };
}

export async function getStudentProgress(studentId: string) {
  const res = await http.get("student/progress", { params: { studentId } });
  return res.data as { progress: any };
}

export async function getStudentNotes(studentId: string) {
  const res = await http.get("student/notes", { params: { studentId } });
  return res.data as { items: any[] };
}

export async function createStudentNote(payload: {
  studentId: string;
  type: string;
  direction: string;
  category: string;
  status: string;
  tags: string[];
  text: string;
}) {
  const res = await http.post("student/notes", payload);
  return res.data as { ok: true; note: any };
}

export async function updateStudentNote(
  noteId: string,
  payload: {
    studentId?: string;
    type?: string;
    direction?: string;
    category?: string;
    status?: string;
    tags?: string[];
    text?: string;
  }
) {
  const res = await http.patch(`student/notes/${noteId}`, payload);
  return res.data as { ok: true; note: any };
}

export async function deleteStudentNote(noteId: string) {
  const res = await http.delete(`student/notes/${noteId}`);
  return res.data as { ok: true };
}

