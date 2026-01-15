import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'SAR'): string {
    return `${currency} ${amount.toLocaleString()}`;
}

export function formatDate(date: Date | number | string): string {
    return new Date(date).toLocaleDateString();
}

export function formatDateTime(date: Date | number | string): string {
    return new Date(date).toLocaleString();
}
