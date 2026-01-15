import axios from 'axios';
import { API_BASE_URL } from './constants';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
    (response) => {
        // Prevent HTML responses (e.g., from SPA fallback 404s) being treated as successful API data
        if (response.headers['content-type']?.includes('text/html')) {
            return Promise.reject(new Error('Received HTML instead of JSON. API might be down or URL is incorrect.'));
        }
        return response;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
    }
);

export default axiosInstance;
