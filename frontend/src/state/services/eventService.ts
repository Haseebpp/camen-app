import axios from '@/lib/axios';
import type { Event, EventStatus, EventStats } from '@/lib/types';

const eventService = {
    async getEvents(): Promise<Event[]> {
        const response = await axios.get('/events');
        return response.data;
    },

    async getEventStats(id: string): Promise<EventStats> {
        const response = await axios.get(`/events/${id}/stats`);
        return response.data;
    },

    async createEvent(eventData: { name: string; date: number; location: string }): Promise<Event> {
        const response = await axios.post('/events', eventData);
        return response.data;
    },

    async updateEventStatus(id: string, status: EventStatus): Promise<Event> {
        const response = await axios.put(`/events/${id}/status`, { status });
        return response.data;
    },

    async updateEventClearedSales(id: string, clearedSalesAmount: number): Promise<Event> {
        const response = await axios.put(`/events/${id}/cleared-sales`, { clearedSalesAmount });
        return response.data;
    },

    async deleteEvent(id: string): Promise<void> {
        await axios.delete(`/events/${id}`);
    },
};

export default eventService;
