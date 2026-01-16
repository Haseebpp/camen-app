import axios from '@/lib/axios';
import type { Financials, DashboardData, EventsReportData } from '@/lib/types';

const reportService = {
    async getFinancials(): Promise<Financials> {
        const response = await axios.get('/reports/financials');
        return response.data;
    },

    async getDashboardData(eventId?: string): Promise<DashboardData> {
        const url = eventId ? `/reports/dashboard?eventId=${eventId}` : '/reports/dashboard';
        const response = await axios.get(url);
        return response.data;
    },

    async getEventsReport(): Promise<EventsReportData> {
        const response = await axios.get('/reports/events-summary');
        return response.data;
    },
};

export default reportService;

