import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ExportLog {
    id: string;
    date: string;
    user: string;
    format: string;
    period: string;
    status: 'ok' | 'fail';
}

export const useSettingsExportStore = defineStore('settingsExport', () => {
    const config = ref({
        comarchId: 'K1',
        encoding: 'UTF-8 (zalecane)',
        category: 'FAKTURA',
        register: 'SPRZEDAŻ',
        autoClients: true,
        includeCorrections: true,
        includeCanceled: true
    });

    const history = ref<ExportLog[]>([
        {
            id: '1',
            date: '2025-05-02 10:15',
            user: 'Karolina Nowak',
            format: 'XML Comarch Optima',
            period: 'Kwiecień 2025',
            status: 'ok'
        },
        {
            id: '2',
            date: '2025-04-01 09:00',
            user: 'Karolina Nowak',
            format: 'XLSX Rejestr',
            period: 'Marzec 2025',
            status: 'ok'
        }
    ]);

    return {
        config,
        history
    };
});
