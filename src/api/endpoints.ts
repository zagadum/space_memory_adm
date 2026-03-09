export const API_ENDPOINTS = {
    // Эндпоинты для загрузки списков (то, что просил бэкенд)
    DICTIONARIES: {
        PAUSE_REASONS: '/v1/dictionaries/pause-reasons',
        PAYMENT_METHODS: '/v1/dictionaries/payment-methods',
        DISCOUNT_TYPES: '/v1/dictionaries/discount-types',
        REFUND_REASONS: '/v1/dictionaries/refund-reasons',
        TARIFFS: '/v1/dictionaries/tariffs',
    },
    // Эндпоинты для модалок и данных ученика
    PAYMENTS: {
        STUDENT_DATA: (id: string | number) => `/v1/students/${id}/payments`,
        UPDATE_TARIFF: '/v1/payments/update-tariff',
        APPLY_PAUSE: '/v1/payments/pause',
        APPLY_DISCOUNT: '/v1/payments/discount',
        PROCESS_REFUND: '/v1/payments/refund',
        ADD_EXTRA: '/v1/payments/extra',
        CHANGE_GROUP: '/v1/payments/change-group',
        CORRECT_BALANCE: '/v1/payments/correct-balance',
        EDIT_INVOICE: '/v1/payments/edit-invoice'
    },
    PROJECTS: {
        DETAIL: (id: string | number) => `/v1/projects/${id}`
    }
};