import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface VatRate {
    id: string;
    rate: string; // "ZW", "23%", etc
    name: string;
    pkwiu: string;
    client_type: string;
    is_default: boolean;
    firma_id: string | 'global';
    legal_base?: string;
}

export const useSettingsVatStore = defineStore('settingsVat', () => {
    const activeVatFirma = ref('global');

    const rates = ref<VatRate[]>([
        {
            id: 'zw',
            rate: 'ZW',
            name: 'Usługi edukacyjne (zwolnione)',
            pkwiu: '85.59.19.0',
            client_type: 'B2C + B2B',
            is_default: true,
            firma_id: 'global',
            legal_base: 'art. 43 ust. 1 pkt 26 lit. b'
        },
        {
            id: '23',
            rate: '23%',
            name: 'Usługi komercyjne / B2B standard',
            pkwiu: '85.59.19.0',
            client_type: 'B2B',
            is_default: false,
            firma_id: 'global'
        },
        {
            id: '8',
            rate: '8%',
            name: 'Usługi sportowe / rekreacyjne',
            pkwiu: '93.13.10.0',
            client_type: 'B2C + B2B',
            is_default: false,
            firma_id: 'global'
        },
        {
            id: '5',
            rate: '5%',
            name: 'Materiały edukacyjne / książki',
            pkwiu: '58.11.1',
            client_type: 'B2C',
            is_default: false,
            firma_id: 'global'
        },
        {
            id: '0',
            rate: '0%',
            name: 'Eksport usług poza UE',
            pkwiu: '85.59.19.0',
            client_type: 'B2B eksport',
            is_default: false,
            firma_id: 'global'
        }
    ]);

    return {
        activeVatFirma,
        rates
    };
});
