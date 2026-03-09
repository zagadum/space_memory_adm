import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface EmailTemplate {
    id: string;
    firma_id: string | 'global';
    type: 'b2c' | 'b2b' | 'korekta' | 'przypomnienie' | 'potwierdzenie' | 'custom';
    name: string;
    subject: string;
    body: string;
    is_default: boolean;
}

export const useSettingsSzablonyStore = defineStore('settingsSzablony', () => {
    const templates = ref<EmailTemplate[]>([
        {
            id: 'global-b2c',
            firma_id: 'global',
            type: 'b2c',
            name: 'Faktura automatyczna po płatności Imoje',
            subject: 'Faktura {{nr_faktury}} — Global Leaders Skills',
            body: 'Szanowna/ny {{imie_nazwisko}},\n\nw załączniku przesyłamy fakturę {{nr_faktury}} za {{opis_uslugi}} ({{miesiac}}).\n\nKwota: {{kwota}} zł · Termin płatności: {{termin_platnosci}}\n\nW przypadku pytań prosimy o kontakt: {{email_firmy}}\n\nDziękujemy za zaufanie,\n{{nazwa_firmy}}',
            is_default: true
        },
        {
            id: 'global-b2b',
            firma_id: 'global',
            type: 'b2b',
            name: 'Faktura B2B (wystawiana ręcznie)',
            subject: 'Faktura {{nr_faktury}} dla {{nazwa_firmy_klienta}}',
            body: 'Szanowni Państwo,\n\nprzesyłamy fakturę {{nr_faktury}} za {{opis_uslugi}}.\n\nDziękujemy za współpracę,\n{{nazwa_firmy}}',
            is_default: false
        },
        {
            id: 'global-korekta',
            firma_id: 'global',
            type: 'korekta',
            name: 'Faktura korygująca (zwrot / korekta)',
            subject: 'Faktura korygująca {{nr_korekty}} — GLS',
            body: 'Szanowna/ny {{imie_nazwisko}},\n\nw załączniku przesyłamy fakturę korygującą {{nr_korekty}} do faktury {{nr_oryginalu}}.\n\nPozdrawiamy,\n{{nazwa_firmy}}',
            is_default: false
        },
        {
            id: 'gls2-b2c',
            firma_id: '2',
            type: 'b2c',
            name: 'Faktura automatyczna — Południe',
            subject: 'Faktura {{nr_faktury}} — E-sklep SM',
            body: 'Witaj {{imie_nazwisko}}!\n\nOto Twoja faktura {{nr_faktury}} z E-sklepu Space Memory.\n\nPozdrawiamy,\nZespół Space Memory',
            is_default: false
        }
    ]);

    const filterTemplates = (firmaId: string, type: string) => {
        return templates.value.filter(t => {
            const matchFirma = !firmaId || t.firma_id === firmaId;
            const matchType = !type || t.type === type;
            return matchFirma && matchType;
        });
    };

    return {
        templates,
        filterTemplates
    };
});
