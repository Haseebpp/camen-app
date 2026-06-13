import axios from '@/lib/axios';

export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
}

export interface AdminProduct {
    _id: string;
    itemCode: string;
    name: string;
    category: string;
    costPrice?: number; // Hidden from UI, kept in backend for future use
    sellingPrice: number;
    stockQuantity: number;
    soldQuantity: number;
    user: { _id: string; name: string; email: string };
    image?: string;
}

export interface AdminSale {
    _id: string;
    timestamp: string;
    type: string;
    totalAmount: number;
    soldBy: string;
    comboName?: string;
    user: { _id: string; name: string; email: string };
    event?: { _id: string; name: string };
}

export interface AdminExpense {
    _id: string;
    description: string;
    category: string;
    amount: number;
    date: string;
    user: { _id: string; name: string; email: string };
    event?: { _id: string; name: string };
}

export interface AdminEvent {
    _id: string;
    name: string;
    date: string;
    location: string;
    status: string;
    user: { _id: string; name: string; email: string };
}

export interface AdminStats {
    counts: {
        users: number;
        products: number;
        sales: number;
        expenses: number;
        events: number;
    };
    financials: {
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
    };
    recentSales: AdminSale[];
    recentUsers: AdminUser[];
}

const adminService = {
    // Stats
    async getStats(): Promise<AdminStats> {
        const response = await axios.get('/admin/stats');
        return response.data;
    },

    // Users
    async getUsers(): Promise<AdminUser[]> {
        const response = await axios.get('/admin/users');
        return response.data;
    },

    async updateUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
        const response = await axios.put(`/admin/users/${id}`, data);
        return response.data;
    },

    async deleteUser(id: string): Promise<void> {
        await axios.delete(`/admin/users/${id}`);
    },

    // Products
    async getProducts(): Promise<AdminProduct[]> {
        const response = await axios.get('/admin/products');
        return response.data;
    },

    async updateProduct(id: string, data: Partial<AdminProduct>): Promise<AdminProduct> {
        const response = await axios.put(`/admin/products/${id}`, data);
        return response.data;
    },

    async deleteProduct(id: string): Promise<void> {
        await axios.delete(`/admin/products/${id}`);
    },

    // Sales
    async getSales(): Promise<AdminSale[]> {
        const response = await axios.get('/admin/sales');
        return response.data;
    },

    async updateSale(id: string, data: Partial<AdminSale>): Promise<AdminSale> {
        const response = await axios.put(`/admin/sales/${id}`, data);
        return response.data;
    },

    async deleteSale(id: string): Promise<void> {
        await axios.delete(`/admin/sales/${id}`);
    },

    // Expenses
    async getExpenses(): Promise<AdminExpense[]> {
        const response = await axios.get('/admin/expenses');
        return response.data;
    },

    async updateExpense(id: string, data: Partial<AdminExpense>): Promise<AdminExpense> {
        const response = await axios.put(`/admin/expenses/${id}`, data);
        return response.data;
    },

    async deleteExpense(id: string): Promise<void> {
        await axios.delete(`/admin/expenses/${id}`);
    },

    // Events
    async getEvents(): Promise<AdminEvent[]> {
        const response = await axios.get('/admin/events');
        return response.data;
    },

    async createEvent(data: { name: string; date: string; location: string }): Promise<AdminEvent> {
        const response = await axios.post('/admin/events', data);
        return response.data;
    },

    async updateEvent(id: string, data: Partial<AdminEvent>): Promise<AdminEvent> {
        const response = await axios.put(`/admin/events/${id}`, data);
        return response.data;
    },

    async deleteEvent(id: string): Promise<void> {
        await axios.delete(`/admin/events/${id}`);
    },
};

export default adminService;

