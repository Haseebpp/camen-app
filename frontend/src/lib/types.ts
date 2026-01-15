// Types matching the backend models

export interface User {
    _id: string;
    name: string;
    email: string;
}

export interface Product {
    _id: string;
    itemCode: string;
    name: string;
    description: string;
    costPrice: number;
    sellingPrice: number;
    stockQuantity: number;
    initialStock: number;
    soldQuantity: number;
    category: string;
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
