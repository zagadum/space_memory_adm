import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Firma } from '../types/settings';

export const useSettingsFirmyStore = defineStore('settingsFirmy', () => {
    const firmy = ref<Firma[]>([
        {
            id: 1,
            name: "Global Leaders Skills Sp. z o.o.",
            nip: "5252970924",
            krs: "0001055763",
            regon: "526267569",
            legal_form: "sp_zoo",
            address_street: "Kabacki Dukt 1 / U1 i U2",
            address_postal: "02-798",
            address_city: "Warszawa",
            vat_status: "zw",
            vat_exemption_reason: "art. 43 ust. 1 pkt 26 lit. b",
            invoice_color: "#4f6ef7",
            invoice_style: "classic",
            show_logo: true,
            show_footer: true,
            is_default: true,
            is_archived: false,
            projekty: [
                { id: 101, name: "Space Memory", emoji: "🚀" },
                { id: 102, name: "INDIGO / Speedy Mind", emoji: "🧠" },
                { id: 103, name: "Olimpiada", emoji: "🏆" }
            ]
        },
        {
            id: 2,
            name: "E-sklep Space Memory Artsiom Hrableuski",
            short_name: "E-sklep SM",
            nip: "5272854902",
            regon: "525651337",
            legal_form: "jdg",
            address_street: "al. Jerozolimskie 123A lok. 19p",
            address_postal: "02-017",
            address_city: "Warszawa",
            vat_status: "zw",
            invoice_color: "#4f6ef7",
            invoice_style: "classic",
            show_logo: true,
            show_footer: true,
            is_default: false,
            is_archived: false,
            projekty: [
                { id: 104, name: "Space Memory — sklep", emoji: "🚀" }
            ]
        },
        {
            id: 3,
            name: "Oleksii Lubenets",
            nip: "5273003388",
            regon: "522099129",
            legal_form: "jdg",
            vat_status: "zw",
            invoice_color: "#10b981",
            invoice_style: "classic",
            show_logo: true,
            show_footer: true,
            is_default: false,
            is_archived: false,
            projekty: []
        }
    ]);

    const activeFirmaId = ref<number | null>(null);

    const loadFirmy = async () => {
        // Mock load
        console.log('Loading firmy from API...');
    };

    const addFirma = (firma: Omit<Firma, 'id'>) => {
        const newId = firmy.value.length > 0 ? Math.max(...firmy.value.map(f => f.id)) + 1 : 1;
        firmy.value.push({ ...firma, id: newId });
    };

    const setDefaultFirma = (id: number) => {
        firmy.value.forEach(f => {
            f.is_default = (f.id === id);
        });
    };

    const archiveFirma = (id: number) => {
        const firma = firmy.value.find(f => f.id === id);
        if (firma) {
            if (firma.is_default) {
                throw new Error("Nie można archiwizować firmy domyślnej");
            }
            firma.is_archived = true;
        }
    };

    return {
        firmy,
        activeFirmaId,
        loadFirmy,
        addFirma,
        setDefaultFirma,
        archiveFirma
    };
});
