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
    meta?: string;
    contract: "signed" | "pending";
    paymentStr: string;
    createdDate: string;
    manager: string | null;
}

export interface NewGroup {
    id: number;
    name: string;
    type: "group" | "individual";
    startDate: string;
    createdDate: string;
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

function getClient(backend: RecruitmentBackend = "default") {
    return backend === "indigo" ? httpRecruitmentIndigo : http;
}

export async function getNewGroups(backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).get(NEW_GROUPS.LIST);
    return res.data as { items: NewGroup[]; data?: NewGroup[] };
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
    const body = {
        name: payload.name,
        type_group: payload.type === 'individual' ? 'prv' : 'all',
        day: payload.day,
        time: payload.time,
        start_date: payload.startDate,
        age_name: payload.age,
        teacher_id: payload.teacherId,
        student_ids: payload.studentIds,
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

export async function editGroup(payload: {
    group_id: number;
    name?: string;
    type_group?: 'all' | 'prv';
    age_name?: '5-7' | '8-10' | '11-14' | '15+';
    status_group?: 'new' | 'archive' | 'start' | 'wait_start';
    teacher_id?: number | null;
    start_date?: string | null;
    day?: string | null;
    time?: string | null;
}, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).post(NEW_GROUPS.EDIT, payload);
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

