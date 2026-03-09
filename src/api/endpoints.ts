export const API_ENDPOINTS = {
    // Эндпоинты для загрузки списков (то, что просил бэкенд)
    DICTIONARIES: {
        PAUSE_REASONS: 'dictionaries/pause-reasons',
        PAYMENT_METHODS: 'dictionaries/payment-methods',
        DISCOUNT_TYPES: 'dictionaries/discount-types',
        REFUND_REASONS: 'dictionaries/refund-reasons',
        TARIFFS: 'dictionaries/tariffs',
    },
    // Эндпоинты для модалок и данных ученика
    PAYMENTS: {
        STUDENT_DATA: (id: string | number) => `students/${id}/payments`,
        UPDATE_TARIFF: 'payments/update-tariff',
        APPLY_PAUSE: 'payments/pause',
        APPLY_DISCOUNT: 'payments/discount',
        PROCESS_REFUND: 'payments/refund',
        ADD_EXTRA: 'payments/extra',
        CHANGE_GROUP: 'payments/change-group',
        CORRECT_BALANCE: 'payments/correct-balance',
        EDIT_INVOICE: 'payments/edit-invoice'
    },
    PROJECTS: {
        DETAIL: (id: string | number) => `projects/${id}`
    }
};