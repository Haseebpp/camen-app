import axios from '@/lib/axios';
import type { Sale, CartItem, SaleType } from '@/lib/types';

const saleService = {
    async getSales(): Promise<Sale[]> {
        const response = await axios.get('/sales');
        return response.data;
    },

    async getSalesByEvent(eventId: string): Promise<Sale[]> {
        const response = await axios.get(`/sales/event/${eventId}`);
        return response.data;
    },

    async createSale(saleData: {
        items: CartItem[];
        type: SaleType;
        comboName?: string;
        eventId?: string;
    }): Promise<Sale> {
        const response = await axios.post('/sales', saleData);
        return response.data;
    },
};

export default saleService;
