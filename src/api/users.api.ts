import httpClient from './httpClient';
import type { User } from '../stores/settingsUsers.store';

/**
 * Users API Service
 * 
 * This service demonstrates the standard way to interact with the backend (Laravel 11).
 * It uses the unified httpClient which handles JSON headers, base URLs, and 
 * automatic Authorization Bearer token injection.
 */
export const usersApi = {
    /**
     * Fetches the list of all users from the backend.
     * Path: GET /api/v1/settings/users
     */
    async fetchUsers(): Promise<User[]> {
        // BACKEND DEV: Uncomment the line below when the endpoint is ready
        // const { data } = await httpClient.get<User[]>('/v1/settings/users');
        // return data;

        // For now, we return an empty array or handle it in the store
        return [];
    },

    /**
     * Updates a specific user's profile.
     * Path: PATCH /api/v1/settings/users/{id}
     */
    async updateUser(id: string, userData: Partial<User>): Promise<User> {
        // BACKEND DEV: Uncomment the line below when the endpoint is ready
        // const { data } = await httpClient.patch<User>(`/v1/settings/users/${id}`, userData);
        // return data;

        // Mock return
        return { id, ...userData } as User;
    },

    /**
     * Deletes (archives) a user.
     * Path: DELETE /api/v1/settings/users/{id}
     */
    async deleteUser(id: string): Promise<void> {
        // BACKEND DEV: Uncomment the line below when the endpoint is ready
        // await httpClient.delete(`/v1/settings/users/${id}`);
    }
};
