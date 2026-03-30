import { http } from "./http";
import type { User } from "../stores/settingsUsers.store";

export interface CreateUserPayload {
    name: string;
    email: string;
    role: string;
    projects: string[];
    password?: string;
    sendInvite?: boolean;
}

export async function getUsers() {
    const res = await http.get("settings/users");
    return res.data as { items: User[] };
}

export async function createUser(payload: CreateUserPayload) {
    const res = await http.post("settings/users", payload);
    return res.data as User;
}

export async function updateUser(id: string, payload: Partial<User>) {
    const res = await http.patch(`settings/users/${id}`, payload);
    return res.data as User;
}

export async function deleteUser(id: string) {
    const res = await http.delete(`settings/users/${id}`);
    return res.data;
}
