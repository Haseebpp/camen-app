import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, Product, SaleRecord, AppSettings, SaleType, CartItem, Expense, Event } from '../types';

interface DataContextType {
  state: AppState;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addProduct: (product: Omit<Product, 'id' | 'soldQuantity'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  recordSale: (items: CartItem[], type: SaleType, comboName?: string, eventId?: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>, eventId?: string) => void;
  deleteExpense: (id: string) => void;
  addEvent: (event: Omit<Event, 'id' | 'status'>) => void;
  updateEventStatus: (id: string, status: 'OPEN' | 'CLOSED') => void;
  deleteEvent: (id: string) => void;
  getFinancials: () => { totalRevenue: number; currentBalance: number; totalExpenses: number };
  isLoading: boolean;
}

const defaultSettings: AppSettings = {
  openingBalance: 1000,
  currency: 'SAR',
  userEmail: 'user@example.com',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial mock data with specified products
const MOCK_PRODUCTS: Product[] = [
  { id: '1', itemCode: 'SW-01', name: 'Shadow Walk', description: 'Premium Fragrance', costPrice: 60, sellingPrice: 180, stockQuantity: 50, initialStock: 50, soldQuantity: 0, category: 'Perfume' },
  { id: '2', itemCode: 'WF-01', name: 'Wild Flame', description: 'Intense spicy scent', costPrice: 60, sellingPrice: 195, stockQuantity: 40, initialStock: 40, soldQuantity: 0, category: 'Perfume' },
  { id: '3', itemCode: 'VS-01', name: 'Violet Silk', description: 'Soft floral notes', costPrice: 60, sellingPrice: 160, stockQuantity: 60, initialStock: 60, soldQuantity: 0, category: 'Perfume' },
  { id: '4', itemCode: 'OR-01', name: 'Oud Risala', description: 'Traditional authentic Oud', costPrice: 40, sellingPrice: 250, stockQuantity: 30, initialStock: 30, soldQuantity: 0, category: 'Oud' },
  { id: '5', itemCode: 'GO-01', name: 'Green Oud', description: 'Fresh woody blend', costPrice: 40, sellingPrice: 230, stockQuantity: 35, initialStock: 35, soldQuantity: 0, category: 'Oud' },
  { id: '6', itemCode: 'EB-01', name: 'Eau Blue', description: 'Oceanic fresh breeze', costPrice: 40, sellingPrice: 140, stockQuantity: 55, initialStock: 55, soldQuantity: 0, category: 'Perfume' },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    products: [],
    sales: [],
    expenses: [],
    events: [],
    settings: defaultSettings,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load from local storage on mount (Simulating DB fetch)
  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem('salesTrackData');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrations for existing data
        if (!parsed.expenses) parsed.expenses = [];
        if (!parsed.events) parsed.events = [];
        setState(parsed);
      } else {
        setState(prev => ({ ...prev, products: MOCK_PRODUCTS }));
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Sync to local storage on change (Simulating DB Push)
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('salesTrackData', JSON.stringify(state));
    }
  }, [state, isLoading]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  }, []);

  const addProduct = useCallback((productData: Omit<Product, 'id' | 'soldQuantity'>) => {
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
      soldQuantity: 0,
    };
    setState(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  }, []);

  const recordSale = useCallback((items: CartItem[], type: SaleType, comboName?: string, eventId?: string) => {
    const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    const newSale: SaleRecord = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      items,
      totalAmount,
      comboName,
      soldBy: state.settings.userEmail,
      eventId
    };

    setState(prev => {
      // Update product stock and sold counts
      const updatedProducts = prev.products.map(p => {
        const soldItem = items.find(i => i.productId === p.id);
        if (soldItem) {
          return {
            ...p,
            stockQuantity: p.stockQuantity - soldItem.quantity,
            soldQuantity: p.soldQuantity + soldItem.quantity
          };
        }
        return p;
      });

      return {
        ...prev,
        products: updatedProducts,
        sales: [newSale, ...prev.sales] // Add to top
      };
    });
  }, [state.settings.userEmail]);

  const addExpense = useCallback((expenseData: Omit<Expense, 'id'>, eventId?: string) => {
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
      eventId
    };
    setState(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses]
    }));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
  }, []);

  const addEvent = useCallback((eventData: Omit<Event, 'id' | 'status'>) => {
    const newEvent: Event = {
      ...eventData,
      id: crypto.randomUUID(),
      status: 'OPEN'
    };
    setState(prev => ({
      ...prev,
      events: [newEvent, ...prev.events]
    }));
  }, []);

  const updateEventStatus = useCallback((id: string, status: 'OPEN' | 'CLOSED') => {
     setState(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, status } : e)
     }));
  }, []);

  const deleteEvent = useCallback((id: string) => {
     // NOTE: This does not delete associated sales/expenses, just the event container.
     setState(prev => ({
       ...prev,
       events: prev.events.filter(e => e.id !== id)
     }));
  }, []);

  const getFinancials = useCallback(() => {
    const totalRevenue = state.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    // Cost of Goods Sold (Inventory cost for sold items)
    const cogs = state.products.reduce((sum, product) => sum + (product.costPrice * product.soldQuantity), 0);
    
    // Operational Expenses (Manually added expenses)
    const operationalExpenses = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const totalExpenses = cogs + operationalExpenses;
    
    // Current Balance = Opening + Revenue - Operational Expenses
    const currentBalance = state.settings.openingBalance + totalRevenue - operationalExpenses;

    return { totalRevenue, currentBalance, totalExpenses };
  }, [state.sales, state.settings.openingBalance, state.products, state.expenses]);

  return (
    <DataContext.Provider value={{ 
      state, 
      updateSettings, 
      addProduct, 
      updateProduct, 
      recordSale, 
      addExpense, 
      deleteExpense, 
      addEvent,
      updateEventStatus,
      deleteEvent,
      getFinancials, 
      isLoading 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};