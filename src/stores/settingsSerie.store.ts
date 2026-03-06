import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface NumberingSerie {
    id: number;
    serie_code: string;
    projekt_name: string;
    firma_name: string;
    last_number: string;
    next_number: string;
    year_month: string;
    color: string;
}

export const useSettingsSerieStore = defineStore('settingsSerie', () => {
    const series = ref<NumberingSerie[]>([
        {
            id: 1,
            serie_code: "FA/SPACE",
            projekt_name: "Space Memory",
            firma_name: "GLS Sp. z o.o.",
            last_number: "042",
            next_number: "043",
            year_month: "2025/05",
            color: "#4f6ef7"
        },
        {
            id: 2,
            serie_code: "FA/INDIGO",
            projekt_name: "INDIGO",
            firma_name: "GLS Sp. z o.o.",
            last_number: "018",
            next_number: "019",
            year_month: "2025/05",
            color: "#8b5cf6"
        },
        {
            id: 3,
            serie_code: "FA/OLIMP",
            projekt_name: "Olimpiada",
            firma_name: "GLS Sp. z o.o.",
            last_number: "067",
            next_number: "068",
            year_month: "2025/05",
            color: "#f59e0b"
        },
        {
            id: 4,
            serie_code: "FA/CAMP",
            projekt_name: "Warsztaty",
            firma_name: "E-sklep SM",
            last_number: "011",
            next_number: "012",
            year_month: "2025/05",
            color: "#06b6d4"
        }
    ]);

    return {
        series
    };
});
