import axios from '@/lib/axios';
import type { Financials, DashboardData, EventsReportData } from '@/lib/types';

const reportService = {
    async getFinancials(): Promise<Financials> {
        const response = await axios.get('/reports/financials');
        return response.data;
    },

    async getDashboardData(): Promise<DashboardData> {
        const response = await axios.get('/reports/dashboard');
        return response.data;
    },

    async getEventsReport(): Promise<EventsReportData> {
        const response = await axios.get('/reports/events-summary');
        return response.data;
    },
};

export default reportService;

