import { http } from './http';
import type { User } from '../stores/settingsUsers.store';

/**
 * Users API Service
 * 
 * This service demonstrates the standard way to interact with the backend (Laravel 11).
 * It uses the unified http which handles JSON headers, base URLs, and 
 * automatic Authorization Bearer token injection.
 */
export const usersApi = {
    /**
     * Fetches the list of all users from the backend.
     * Path: GET /v1/settings/users
     */
    async fetchUsers(): Promise<User[]> {
        // BACKEND DEV: Uncomment the line below when the endpoint is ready
        // const { data } = await http.get<User[]>('settings/users');
        // return data;

        // For now, we return an empty array or handle it in the store
        // ... (mock etc)
        return [];
    },

    /**
     * Updates a specific user's profile.
     * Path: PATCH /v1/settings/users/{id}
     */
    async updateUser(id: string, userData: Partial<User>): Promise<User> {
        // BACKEND DEV: Uncomment the line below when the endpoint is ready
        // const { data } = await http.patch<User>(`settings/users/${id}`, userData);
        // return data;

        // Mock return
        return { id, ...userData } as User;
    },

    /**
     * Deletes (archives) a user.
     * Path: DELETE /v1/settings/users/{id}
     */
    async deleteUser(id: string): Promise<void> {
        // BACKEND DEV: Uncomment the line below when the endpoint is ready
        // await http.delete(`settings/users/${id}`);
    }
};
