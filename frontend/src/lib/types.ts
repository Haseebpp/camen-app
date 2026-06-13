// Types matching the backend models

export interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin?: boolean;
}

export interface Product {
    _id: string;
    itemCode: string;
    name: string;
    description: string;
    costPrice?: number; // Hidden from UI, kept in backend for future use
    sellingPrice: number;
    stockQuantity: number;
    initialStock: number;
    soldQuantity: number;
    category: string;
    image?: string;
}

export type SaleType = 'INDIVIDUAL' | 'COMBO';

export interface CartItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

export interface Sale {
    _id: string;
    timestamp: string;
    type: SaleType;
    items: CartItem[];
    totalAmount: number;
    comboName?: string;
    soldBy: string;
    event?: { _id: string; name: string } | null;
}

export interface Expense {
    _id: string;
    description: string;
    category: string;
    amount: number;
    date: string;
    event?: { _id: string; name: string } | null;
}

export type EventStatus = 'OPEN' | 'CLOSED';

export interface Event {
    _id: string;
    name: string;
    date: string;
    location: string;
    status: EventStatus;
    clearedSalesAmount?: number;
}

export interface EventStats {
    revenue: number;
    expenses: number;
    cogs: number;
    profit: number;
    saleCount: number;
    expenseCount: number;
}

export interface AppSettings {
    openingBalance: number;
    currency: string;
    userEmail: string;
    clearedSalesAmount?: number;
}

export interface Financials {
    openingBalance: number;
    totalRevenue: number;
    totalExpenses: number;
    cogs: number;
    operationalExpenses: number;
    currentBalance: number;
}

export interface DashboardData {
    financials: {
        openingBalance: number;
        totalRevenue: number;
        totalExpenses: number;
        currentBalance: number;
    };
    recentSales: { name: string; amount: number }[];
    lowStockProducts: { name: string; stock: number }[];
    salesCount: number;
    productsCount: number;
}

// Event Report Types
export interface EventSummary {
    event: Event;
    revenue: number;
    expenses: number;
    cogs: number;
    profit: number;
    saleCount: number;
    expenseCount: number;
}

export interface StaffPerformance {
    staffName: string;
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
}

export interface ExpenseByCategory {
    category: string;
    total: number;
    count: number;
}

export interface SalesTimelineItem {
    date: string;
    amount: number;
}

export interface EventsReportData {
    events: EventSummary[];
    staffPerformance: StaffPerformance[];
    expensesByCategory: ExpenseByCategory[];
    salesTimeline: SalesTimelineItem[];
    totals: {
        revenue: number;
        expenses: number;
        profit: number;
    };
}

