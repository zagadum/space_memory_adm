export const API_ENDPOINTS = {
    // Эндпоинты для загрузки списков (то, что просил бэкенд)
    DICTIONARIES: {
        PAUSE_REASONS: '/api/v1/dictionaries/pause-reasons',
        PAYMENT_METHODS: '/api/v1/dictionaries/payment-methods',
        DISCOUNT_TYPES: '/api/v1/dictionaries/discount-types',
        REFUND_REASONS: '/api/v1/dictionaries/refund-reasons',
        TARIFFS: '/api/v1/dictionaries/tariffs',
    },
    // Эндпоинты для модалок и данных ученика
    PAYMENTS: {
        STUDENT_DATA: (id: string | number) => `/api/v1/students/${id}/payments`,
        UPDATE_TARIFF: '/api/v1/payments/update-tariff',
        APPLY_PAUSE: '/api/v1/payments/pause',
        APPLY_DISCOUNT: '/api/v1/payments/discount',
        PROCESS_REFUND: '/api/v1/payments/refund',
        ADD_EXTRA: '/api/v1/payments/extra',
        CHANGE_GROUP: '/api/v1/payments/change-group',
        CORRECT_BALANCE: '/api/v1/payments/correct-balance',
        EDIT_INVOICE: '/api/v1/payments/edit-invoice'
    }
};