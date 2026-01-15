import axios from '@/lib/axios';
import type { Product } from '@/lib/types';

const productService = {
    async getProducts(): Promise<Product[]> {
        const response = await axios.get('/products');
        return response.data;
    },

    async getProduct(id: string): Promise<Product> {
        const response = await axios.get(`/products/${id}`);
        return response.data;
    },

    async createProduct(product: Omit<Product, '_id' | 'soldQuantity'>): Promise<Product> {
        const response = await axios.post('/products', product);
        return response.data;
    },

    async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
        const response = await axios.put(`/products/${id}`, updates);
        return response.data;
    },

    async deleteProduct(id: string): Promise<void> {
        await axios.delete(`/products/${id}`);
    },
};

export default productService;
