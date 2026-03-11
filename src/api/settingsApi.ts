import { http } from "./http";
import type { User } from "../stores/settingsUsers.store";

export async function getUsers() {
    const res = await http.get("settings/users");
    // Returns { items: User[] }
    return res.data as { items: User[] };
}

export async function updateUser(id: string, payload: Partial<User>) {
    const res = await http.patch(`settings/users/${id}`, payload);
    return res.data as User;
}

export async function deleteUser(id: string) {
    const res = await http.delete(`settings/users/${id}`);
    return res.data;
}
