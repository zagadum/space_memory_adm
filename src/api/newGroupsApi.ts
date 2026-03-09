import { http } from "./http";

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

export async function getNewGroups() {
    const res = await http.get("/api/new-groups");
    return res.data as { items: NewGroup[] };
}

export async function getNewGroupStudents(groupId: number) {
    const res = await http.get("/api/new-groups/students", { params: { groupId } });
    return res.data as { items: NewGroupStudent[] };
}

export async function getMasterStudents() {
    const res = await http.get("/api/new-groups/master-students");
    return res.data as { items: MasterStudent[] };
}

export async function getTeachers() {
    const res = await http.get("/api/new-groups/teachers");
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
}) {
    const res = await http.post("/api/new-groups/create", payload);
    return res.data as { ok: true; group: NewGroup };
}

export async function startGroup(groupId: number) {
    const res = await http.post("/api/new-groups/start", { groupId });
    return res.data as { ok: true };
}

export async function deleteNewGroup(groupId: number) {
    const res = await http.post("/api/new-groups/delete", { groupId });
    return res.data as { ok: true };
}

export async function addStudentsToGroup(payload: { groupId: number; studentIds: number[] }) {
    const res = await http.post("/api/new-groups/add-students", payload);
    return res.data as { ok: true; added: number };
}

export async function removeStudentFromGroup(payload: { groupId: number; studentName: string }) {
    const res = await http.post("/api/new-groups/remove-student", payload);
    return res.data as { ok: true };
}
