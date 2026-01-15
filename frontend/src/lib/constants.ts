export const API_BASE_URL = '/api';

export const SALE_TYPES = {
    INDIVIDUAL: 'INDIVIDUAL',
    COMBO: 'COMBO',
} as const;

export const EVENT_STATUS = {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
} as const;

export const PRESET_COMBOS = [
    {
        name: 'CMN BLND 1 OFFER',
        price: 100.0,
        items: [
            { name: 'Oud Risala', qty: 1 },
            { name: 'Green Oud', qty: 1 },
            { name: 'Eau Blue', qty: 1 },
        ],
    },
    {
        name: 'CMN BLND 2 OFFER',
        price: 150.0,
        items: [
            { name: 'Wild Flame', qty: 1 },
            { name: 'Shadow Walk', qty: 1 },
            { name: 'Eau Blue', qty: 1 },
        ],
    },
];

export const LOGO_URL = 'https://placehold.co/400x150/transparent/D4AF37?text=CAMEN&font=playfair-display';
