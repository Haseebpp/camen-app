import axios from '@/lib/axios';
import type { AppSettings } from '@/lib/types';

const settingsService = {
    async getSettings(): Promise<AppSettings> {
        const response = await axios.get('/settings');
        return response.data;
    },

    async updateSettings(data: { openingBalance?: number; currency?: string }): Promise<AppSettings> {
        const response = await axios.put('/settings', data);
        return response.data;
    },
};

export default settingsService;
