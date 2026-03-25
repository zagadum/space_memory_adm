import { http, httpRecruitmentIndigo, type RecruitmentBackend } from "./http";

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
    const res = await getClient(backend).get("new-groups");
    return res.data as { items: NewGroup[] };
}

export async function getNewGroupStudents(groupId: number, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).get("new-groups/students", { params: { groupId } });
    return res.data as { items: NewGroupStudent[] };
}

export async function getMasterStudents(backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).get("new-groups/master-students");
    return res.data as { items: MasterStudent[] };
}

export async function getTeachers(backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).get("new-groups/teachers");
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
    const res = await getClient(backend).post("new-groups/create", payload);
    return res.data as { ok: true; group: NewGroup };
}

export async function startGroup(groupId: number, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).post("new-groups/start", { groupId });
    return res.data as { ok: true };
}

export async function deleteNewGroup(groupId: number, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).post("new-groups/delete", { groupId });
    return res.data as { ok: true };
}

export async function addStudentsToGroup(payload: { groupId: number; studentIds: number[] }, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).post("new-groups/add-students", payload);
    return res.data as { ok: true; added: number };
}

export async function removeStudentFromGroup(payload: { groupId: number; studentId: number }, backend: RecruitmentBackend = "default") {
    const res = await getClient(backend).post("new-groups/remove-student", payload);
    return res.data as { ok: true };
}
