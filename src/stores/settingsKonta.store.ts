import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface BankAccount {
    id: number;
    iban: string;
    bank_name: string;
    currency: string;
    label: string;
    is_default: boolean;
}

export const useSettingsKontaStore = defineStore('settingsKonta', () => {
    const accounts = ref<BankAccount[]>([
        {
            id: 1,
            iban: "PL 12 1234 5678 0000 0001 2345 6789",
            bank_name: "Santander Bank Polska",
            currency: "PLN",
            label: "Warszawa — główne",
            is_default: true
        },
        {
            id: 2,
            iban: "PL 34 2500 0003 0000 4567 8901 2345",
            bank_name: "mBank",
            currency: "PLN",
            label: "Kraków",
            is_default: false
        },
        {
            id: 3,
            iban: "PL 56 1090 2590 0000 0001 4950 3219",
            bank_name: "PKO BP",
            currency: "PLN",
            label: "Wrocław",
            is_default: false
        }
    ]);

    const setDefaultAccount = (id: number) => {
        accounts.value.forEach(acc => {
            acc.is_default = (acc.id === id);
        });
    };

    const addAccount = (acc: Omit<BankAccount, 'id'>) => {
        const newId = accounts.value.length > 0 ? Math.max(...accounts.value.map(a => a.id)) + 1 : 1;
        const newAccount = { ...acc, id: newId };
        if (newAccount.is_default) {
            accounts.value.forEach(a => a.is_default = false);
        }
        accounts.value.push(newAccount);
    };

    const updateAccount = (acc: BankAccount) => {
        const index = accounts.value.findIndex(a => a.id === acc.id);
        if (index !== -1) {
            if (acc.is_default) {
                accounts.value.forEach(a => a.is_default = false);
            }
            accounts.value[index] = { ...acc };
        }
    };

    const removeAccount = (id: number) => {
        const index = accounts.value.findIndex(acc => acc.id === id);
        if (index !== -1) {
            const wasDefault = accounts.value[index].is_default;
            accounts.value.splice(index, 1);
            if (wasDefault && accounts.value.length > 0) {
                accounts.value[0].is_default = true;
            }
        }
    };

    return {
        accounts,
        addAccount,
        updateAccount,
        removeAccount,
        setDefaultAccount
    };
});
