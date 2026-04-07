import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Discount {
    id: string;
    label: string;
}

export interface Transaction {
    id: string;
    month: string;
    amount: number;
    discount: number;
    total: number;
    status: 'paid' | 'pending' | 'overpayment' | 'cancelled';
}

export const useStudentPaymentsStore = defineStore('studentPayments', () => {
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const subscriptionStatus = ref<'active' | 'inactive' | 'paused'>('inactive');

    const transactions = ref<Transaction[]>([]);

    const generateTransactions = (monthsCount = 24) => {
        const result: Transaction[] = [];
        const monthNames = ['Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень', 'Січень'];
        let startYear = 2026;

        for (let i = 0; i < monthsCount; i++) {
            const monthIdx = (1 + i) % 12; // Start from February index (1)
            const year = startYear + Math.floor((1 + i) / 12);

            result.push({
                id: `tr_${i + 1}`,
                month: `${monthNames[monthIdx]} ${year}`,
                amount: 490.00,
                discount: i === 1 ? 100.00 : 0,
                total: i === 1 ? 390.00 : 490.00,
                status: i === 0 ? 'paid' : 'pending'
            });
        }
        transactions.value = result;
    };

    const generatePayments = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            subscriptionStatus.value = 'active';
            generateTransactions(24);
        } catch (e) {
            error.value = 'Failed to generate payments';
        } finally {
            isLoading.value = false;
        }
    };

    const pauseSubscription = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            subscriptionStatus.value = 'paused';
            // Mark pending as cancelled/paused in a real app
            transactions.value.forEach(t => {
                if (t.status === 'pending') t.status = 'cancelled';
            });
        } catch (e) {
            error.value = 'Failed to pause subscription';
        } finally {
            isLoading.value = false;
        }
    };

    const resumeSubscription = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            subscriptionStatus.value = 'active';
            transactions.value.forEach(t => {
                if (t.status === 'cancelled') t.status = 'pending';
            });
        } catch (e) {
            error.value = 'Failed to resume subscription';
        } finally {
            isLoading.value = false;
        }
    };

    const cancelSubscription = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            subscriptionStatus.value = 'inactive';
            transactions.value = [];
        } catch (e) {
            error.value = 'Failed to cancel subscription';
        } finally {
            isLoading.value = false;
        }
    };

    const applyDiscount = async (discountId: string) => {
        isLoading.value = true;
        error.value = null;
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            // TODO: apply discount via API
        } catch (e) {
            error.value = 'Failed to apply discount';
        } finally {
            isLoading.value = false;
        }
    };

    const activeDiscounts = ref<Discount[]>([
        { id: 'd_1', label: 'Скидка -100 zł на первый месяц' }
    ]);

    const downloadInvoice = async (transactionId: string) => {
        // TODO: download invoice via API
    };

    // Initial fill if active
    if (subscriptionStatus.value === 'active') {
        generateTransactions(24);
    }

    return {
        isLoading,
        error,
        subscriptionStatus,
        transactions,
        activeDiscounts,
        generatePayments,
        pauseSubscription,
        resumeSubscription,
        cancelSubscription,
        applyDiscount,
        downloadInvoice
    };
});
