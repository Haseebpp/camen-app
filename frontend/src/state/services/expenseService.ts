import axios from '@/lib/axios';
import type { Expense } from '@/lib/types';

const expenseService = {
    async getExpenses(): Promise<Expense[]> {
        const response = await axios.get('/expenses');
        return response.data;
    },

    async getExpensesByEvent(eventId: string): Promise<Expense[]> {
        const response = await axios.get(`/expenses/event/${eventId}`);
        return response.data;
    },

    async createExpense(expenseData: {
        description: string;
        category: string;
        amount: number;
        date: number;
        eventId?: string;
    }): Promise<Expense> {
        const response = await axios.post('/expenses', expenseData);
        return response.data;
    },

    async deleteExpense(id: string): Promise<void> {
        await axios.delete(`/expenses/${id}`);
    },
};

export default expenseService;
