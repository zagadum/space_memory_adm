import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Integration {
    id: string;
    name: string;
    desc: string;
    icon: string;
    color: string;
    status: 'active' | 'inactive' | 'off';
    statusText: string;
    type: string;
}

export const useSettingsIntegrationsStore = defineStore('settingsIntegrations', () => {
    const integrations = ref<Integration[]>([
        {
            id: 'imoje',
            name: 'Imoje (ING Bank Śląski)',
            desc: 'Bramka płatności online · webhook → auto-faktura · endpoint: /api/v1/webhooks/imoje',
            icon: '💳',
            color: 'rgba(16,185,129,.12)',
            status: 'active',
            statusText: '✓ Aktywna',
            type: 'payment'
        },
        {
            id: 'ksef',
            name: 'KSeF — Krajowy System e-Faktur',
            desc: 'Obowiązkowy od 1 kwietnia 2026 · Format FA(3) XML · bramka Ministerstwa Finansów',
            icon: '🟦',
            color: 'rgba(79,110,247,.12)',
            status: 'inactive',
            statusText: '⚠ Nieaktywna',
            type: 'tax'
        },
        {
            id: 'whatsapp',
            name: 'WhatsApp Business API',
            desc: 'Automatyczne wiadomości do rodziców · powiadomienia o fakturach i płatnościach',
            icon: '💬',
            color: 'rgba(37,211,102,.12)',
            status: 'off',
            statusText: 'Nieaktywna',
            type: 'comm'
        },
        {
            id: 'zoom',
            name: 'Zoom API',
            desc: 'Auto-generowanie linków do zajęć online · synchronizacja z harmonogramem grup',
            icon: '🎥',
            color: 'rgba(0,123,255,.12)',
            status: 'off',
            statusText: 'Nieaktywna',
            type: 'meeting'
        },
        {
            id: 'comarch',
            name: 'Comarch ERP Optima',
            desc: 'Eksport faktur XML · bez bezpośredniego API · pliki do ręcznego importu w Comarch',
            icon: '📊',
            color: 'rgba(245,158,11,.12)',
            status: 'active',
            statusText: '✓ Eksport XML',
            type: 'erp'
        }
    ]);

    return {
        integrations
    };
});
