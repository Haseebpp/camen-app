import axios from '@/lib/axios';
import type { User } from '@/lib/types';

const authService = {
    async register(credentials: { name: string; email: string; password: string }): Promise<User> {
        const response = await axios.post('/auth/register', credentials);
        return response.data;
    },

    async login(credentials: { email: string; password: string }): Promise<User> {
        const response = await axios.post('/auth/login', credentials);
        return response.data;
    },

    async logout(): Promise<void> {
        await axios.post('/auth/logout');
    },

    async getProfile(): Promise<User> {
        const response = await axios.get('/auth/profile');
        return response.data;
    },

    async updateProfile(data: { name?: string; email?: string; password?: string }): Promise<User> {
        const response = await axios.put('/auth/profile', data);
        return response.data;
    },
};

export default authService;
