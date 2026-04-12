import { http, httpRecruitmentIndigo, type RecruitmentBackend } from "./http";
import { NEW_GROUPS } from "./endpoints";

export interface NewGroupTeacher {
    id: number;
    name: string;
    initials: string;
    color: string;
}

export interface NewGroupManager {
    name: string;
    initials: string;
    color: string;
}

export interface NewGroupStudent {
    id: number | string;
    name: string;
    age: number;
    phone?: string;
    email?: string;
    meta?: string;
    contract: "signed" | "pending";
    isPaid: boolean;
    paymentStr: string;
    enrollDate: string;
    registeredAt: string;
    createdDate: string; // Legacy
    manager: string | null;
}

export interface NewGroup {
    id: number;
    name: string;
    type: "group" | "individual";
    type_group: "group" | "individual";
    startDate: string;
    createdDate: string;
    studentsCount: number;
    totalSlots: number;
    paid: number;
    manager: NewGroupManager | null;
    teacher: NewGroupTeacher | null;
    day: string;
    time: string;
    age: string | null;
    students: (number | string)[];
}

export interface MasterStudent {
    id: number;
    name: string;
    age: number;
    meta: string;
    initials: string;
    color: string;
}

type WorkdayKey = 'workday1' | 'workday2' | 'workday3' | 'workday4' | 'workday5' | 'workday6' | 'workday7'
type WorkdayFlags = Record<WorkdayKey, 0 | 1>

function emptyWorkdayFlags(): WorkdayFlags {
    return {
        workday1: 0,
        workday2: 0,
        workday3: 0,
        workday4: 0,
        workday5: 0,
        workday6: 0,
        workday7: 0,
    }
}

function normalizeDayToIndex(day: string | number | null | undefined): number | null {
    if (day === null || day === undefined) return null

    const raw = String(day).trim()
    if (!raw) return null

    if (/^[1-7]$/.test(raw)) return Number(raw)

    const normalized = raw.toLowerCase().replace(/[.\s]+/g, '')
    const map: Record<string, number> = {
        monday: 1, mon: 1, 'понедельник': 1, 'понеділок': 1, 'пн': 1,
        tuesday: 2, tue: 2, tues: 2, 'вторник': 2, 'вівторок': 2, 'вт': 2,
        wednesday: 3, wed: 3, 'среда': 3, 'середа': 3, 'ср': 3,
        thursday: 4, thu: 4, thur: 4, thurs: 4, 'четверг': 4, 'четвер': 4, 'чт': 4,
        friday: 5, fri: 5, 'пятница': 5, "п'ятниця": 5, 'пт': 5,
        saturday: 6, sat: 6, 'суббота': 6, 'субота': 6, 'сб': 6,
        sunday: 7, sun: 7, 'воскресенье': 7, 'неділя': 7, 'вс': 7, 'нд': 7,
    }

    return map[normalized] ?? null
}

function buildWorkdayFlags(day: string | number | null | undefined): WorkdayFlags {
    const flags = emptyWorkdayFlags()
    const idx = normalizeDayToIndex(day)
    if (idx === null) return flags

    const key = `workday${idx}` as WorkdayKey
    flags[key] = 1
    return flags
}

function getClient(backend: RecruitmentBackend = "default") {
    return backend === "indigo" ? httpRecruitmentIndigo : http;
}

function normalizeTypeGroup(raw: any): "group" | "individual" {
    const value = String(raw ?? '').trim()
    return value === 'individual' || value === 'prv' ? 'individual' : 'group'
}

function normalizeNewGroup(raw: any): NewGroup {
    const typeGroup = normalizeTypeGroup(raw?.type_group ?? raw?.type)
    const students = Array.isArray(raw?.students) ? raw.students : []
    const studentsCount = Number(raw?.studentsCount ?? raw?.students_count ?? students.length ?? 0)
    return {
        id: Number(raw?.id ?? 0),
        name: String(raw?.name ?? ''),
        type: typeGroup,
        type_group: typeGroup,
        startDate: String(raw?.startDate ?? ''),
        createdDate: String(raw?.createdDate ?? ''),
        studentsCount,
        totalSlots: Number(raw?.totalSlots ?? raw?.total_slot ?? 0),
        paid: Number(raw?.paid ?? 0),
        manager: raw?.manager ?? null,
        teacher: raw?.teacher ?? null,
        day: String(raw?.day ?? ''),
        time: String(raw?.time ?? ''),
        age: raw?.age ?? raw?.age_name ?? null,
        students,
    }
}

export async function getNewGroups(backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).get(NEW_GROUPS.LIST);
    const items = Array.isArray(res.data?.items) ? res.data.items.map((item: any) => normalizeNewGroup(item)) : []
    return { items, data: items } as { items: NewGroup[]; data?: NewGroup[] };
}

export async function getNewGroupStudents(groupId: number, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).get(NEW_GROUPS.STUDENTS, { params: { groupId } });
    return res.data as { items: NewGroupStudent[] };
}

export async function getMasterStudents(backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).get(NEW_GROUPS.MASTER_STUDENTS);
    return res.data as { items: MasterStudent[] };
}

export async function getTeachers(backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).get(NEW_GROUPS.TEACHERS);
    return res.data as { items: NewGroupTeacher[] };
}

export async function createNewGroup(payload: {
    name: string;
    type: "group" | "individual";
    day: string;
    time: string;
    startDate: string;
    age: string | null;
    teacherId: number | null;
    studentIds: number[];
}, backend: RecruitmentBackend = "default") {
    const workdays = buildWorkdayFlags(payload.day)
    const body = {
        name: payload.name,
        type_group: payload.type,
        type: payload.type,
        time: payload.time,
        start_date: payload.startDate,
        age: payload.age,
        age_name: payload.age,
        teacher_id: payload.teacherId,
        student_ids: payload.studentIds,
        ...workdays,
    };
    const res = await getClient(backend).post(NEW_GROUPS.CREATE, body);
    return res.data as { ok: true; group: NewGroup; data?: NewGroup };
}

export async function startGroup(groupId: number, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).post(NEW_GROUPS.START, { groupId });
    return res.data as { ok: true };
}

export async function deleteNewGroup(groupId: number, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).post(NEW_GROUPS.DELETE, { groupId });
    return res.data as { ok: true };
}

export async function addStudentsToGroup(payload: { groupId: number; studentIds: number[] }, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).post(NEW_GROUPS.ADD_STUDENTS, payload);
    return res.data as { ok: true; added: number };
}

export async function removeStudentFromGroup(payload: { groupId: number; studentId: number }, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).post(NEW_GROUPS.REMOVE_STUDENT, payload);
    return res.data as { ok: true };
}

export async function archiveStudentFromGroup(payload: { groupId: number; studentId: number }, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).post(NEW_GROUPS.ARCHIVE_STUDENT, payload);
    return res.data as { ok: true };
}

export async function transferStudentFromGroup(payload: { groupId: number; studentId: number }, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).post(NEW_GROUPS.TRANSFER_STUDENT, payload);
    return res.data as { ok: true };
}

export async function emailStudentFromGroup(payload: { groupId: number; studentId: number }, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).post(NEW_GROUPS.EMAIL_STUDENT, payload);
    return res.data as { ok: true };
}

export async function editGroup(payload: {
    group_id: number;
    name?: string;
    type_group?: 'group' | 'individual' | 'all' | 'prv';
    age_name?: '5-7' | '8-10' | '11-14' | '15+';
    age?: 'junior' | 'middle' | 'senior' | 'adult' | null;
    status_group?: 'new' | 'archive' | 'start' | 'wait_start';
    teacher_id?: number | null;
    start_date?: string | null;
    day?: string | null;
    time?: string | null;
}, backend: RecruitmentBackend = "default") {
    const body = {
        ...payload,
        ...(payload.day !== undefined ? buildWorkdayFlags(payload.day) : {}),
    }
    delete (body as { day?: string | null }).day

    const res = await getClient(backend).post(NEW_GROUPS.EDIT, body);
    return res.data as { success: true; data: NewGroup };
}

export async function getGroupFullInfo(group_id: number, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).post(NEW_GROUPS.FULL_INFO, { group_id });
    return res.data as {
        success: true;
        data: {
            group: NewGroup;
            students: NewGroupStudent[];
            counters: { students_count: number; paid_count: number; contract_signed_count: number; age_name: string | null };
        };
    };
}

export async function updateGroupStatus(group_id: number, status_group: 'new' | 'archive' | 'start' | 'wait_start', backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).post(NEW_GROUPS.UPDATE_STATUS, { group_id, status_group });
    return res.data as { success: true; data: { group_id: number; old_status: string; new_status: string } };
}

