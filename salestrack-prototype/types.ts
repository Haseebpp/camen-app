export interface Product {
  id: string;
  itemCode: string;
  name: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number; // Current balance
  initialStock: number;
  soldQuantity: number;
  category: string;
}

export enum SaleType {
  INDIVIDUAL = 'INDIVIDUAL',
  COMBO = 'COMBO',
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface SaleRecord {
  id: string;
  timestamp: number;
  type: SaleType;
  items: CartItem[];
  totalAmount: number;
  comboName?: string; // If it was a predefined combo
  soldBy: string; // Email or User ID
  eventId?: string; // Link to specific event
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: number; // timestamp
  eventId?: string; // Link to specific event
}

export interface Event {
  id: string;
  name: string;
  date: number;
  location: string;
  status: 'OPEN' | 'CLOSED';
}

export interface AppSettings {
  openingBalance: number;
  currency: string;
  userEmail: string;
}

export interface AppState {
  products: Product[];
  sales: SaleRecord[];
  expenses: Expense[];
  events: Event[];
  settings: AppSettings;
}