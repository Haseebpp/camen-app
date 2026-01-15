import axios from '@/lib/axios';
import type { Financials, DashboardData } from '@/lib/types';

const reportService = {
    async getFinancials(): Promise<Financials> {
        const response = await axios.get('/reports/financials');
        return response.data;
    },

    async getDashboardData(): Promise<DashboardData> {
        const response = await axios.get('/reports/dashboard');
        return response.data;
    },
};

export default reportService;
