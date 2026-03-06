import { http } from "./http";

export interface StudentTabsResponse<T> {
  data: T;
}

export const STUDENTS_ENDPOINT = "/settings/users";

export async function getStudents() {
  const res = await http.get(STUDENTS_ENDPOINT, { params: { role: 'student' } });
  return res.data as { items: any[] };
}

export async function getStudentGroups(studentId: string) {
  const res = await http.get("/student/groups", { params: { studentId } });
  return res.data as { items: any[] };
}

export async function changeStudentGroup(payload: {
  studentId: string;
  programId: string;
  fromGroup: string;
  toGroup: string;
  reason?: string;
}) {
  const res = await http.post("/student/change-group", payload);
  return res.data as { ok: true };
}

export async function setTrainerPresence(payload: {
  studentId: string;
  groupId: string;
  trainerId: string;
  presence: string;
}) {
  const res = await http.post("/student/trainer-presence", payload);
  return res.data as { ok: true };
}

export async function getStudentInfo(studentId: string) {
  const res = await http.get("/student/info", { params: { studentId } });
  return res.data as { info: any };
}

export async function updateStudentInfo(payload: { studentId: string; patch: any }) {
  const res = await http.post("/student/info", payload);
  return res.data as { ok: true; info: any };
}

export async function getStudentAttendance(studentId: string) {
  const res = await http.get("/student/attendance", { params: { studentId } });
  return res.data as { attendance: any };
}

export async function setAttendanceMark(payload: {
  studentId: string;
  attendanceId: string;
  mark: string;
  note?: string;
}) {
  const res = await http.post("/student/attendance", payload);
  return res.data as { ok: true };
}

export async function getStudentProgress(studentId: string) {
  const res = await http.get("/student/progress", { params: { studentId } });
  return res.data as { progress: any };
}

export async function getStudentNotes(studentId: string) {
  const res = await http.get("/student/notes", { params: { studentId } });
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
  const res = await http.post("/student/notes", payload);
  return res.data as { ok: true; note: any };
}
