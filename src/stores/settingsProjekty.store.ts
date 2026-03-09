import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Project {
    id: number;
    name: string;
    slug: string;
    emoji: string;
    firma_id: number | null;
    invoice_serie: string;
    cities: string[];
    is_active: boolean;
}

export const useSettingsProjektyStore = defineStore('settingsProjekty', () => {
    const projects = ref<Project[]>([
        {
            id: 1,
            name: "Space Memory",
            slug: "space",
            emoji: "🚀",
            firma_id: 1,
            invoice_serie: "FA/SPACE",
            cities: ["Warszawa", "Gdańsk"],
            is_active: true
        },
        {
            id: 2,
            name: "INDIGO / Speedy Mind",
            slug: "indigo",
            emoji: "🧠",
            firma_id: 1,
            invoice_serie: "FA/INDIGO",
            cities: ["Warszawa", "Kraków", "Wrocław"],
            is_active: true
        },
        {
            id: 3,
            name: "Olimpiada",
            slug: "olimp",
            emoji: "🏆",
            firma_id: 1,
            invoice_serie: "FA/OLIMP",
            cities: ["Wszystkie miasta"],
            is_active: true
        },
        {
            id: 4,
            name: "Warsztaty / Obozy",
            slug: "camp",
            emoji: "🎓",
            firma_id: 2,
            invoice_serie: "FA/CAMP",
            cities: ["Projekt sezonowy"],
            is_active: true
        }
    ]);

    const updateFirmaAssignment = (projectId: number, firmaId: number | null) => {
        const project = projects.value.find(p => p.id === projectId);
        if (project) {
            project.firma_id = firmaId;
        }
    };

    return {
        projects,
        updateFirmaAssignment
    };
});
