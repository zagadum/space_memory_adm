import { defineStore } from 'pinia';
import type { Project } from '../types/projects';

export const useProjectsStore = defineStore('projects', {
    state: () => ({
        projects: [
            {
                id: '1',
                name: 'Space Memory',
                code: 'SPACE',
                type: 'recurring',
                status: 'active',
                icon: '🚀',
                color: 'blue',
                description: 'Program pamięci dla dzieci 5–18 lat. Cena abonamentu pochodzi z karty ucznia.',
                invoicePatternB2C: 'FA/SPACE/RRRR/MM/NNN',
                invoicePatternB2B: 'FV/B2B/RRRR/MM/NNN',
                firmaId: 'gls-main',
                stats: {
                    studentsCount: 342,
                    invoicesCount: 138,
                    fixedPrice: null
                }
            },
            {
                id: '2',
                name: 'INDIGO Speedy Mind',
                code: 'INDIGO',
                type: 'recurring',
                status: 'active',
                icon: '🧠',
                color: 'purple',
                description: 'Szybkie liczenie metodą Anzan. Cena pochodzi z karty ucznia.',
                invoicePatternB2C: 'FA/INDIGO/RRRR/MM/NNN',
                invoicePatternB2B: 'FV/B2B/RRRR/MM/NNN',
                firmaId: 'gls-main',
                stats: {
                    studentsCount: 198,
                    invoicesCount: 84,
                    fixedPrice: null
                }
            },
            {
                id: '3',
                name: 'Olimpiada GLS 2025',
                code: 'OLIMP',
                type: 'onetime',
                status: 'active',
                icon: '🏆',
                color: 'amber',
                description: 'Coroczna olimpiada pamięci. Opłata wpisowa jednorazowa — stała dla wszystkich.',
                invoicePatternB2C: 'FA/OLIMP/RRRR/MM/NNN',
                invoicePatternB2B: 'FV/B2B/RRRR/MM/NNN',
                firmaId: 'gls-main',
                stats: {
                    studentsCount: 67,
                    invoicesCount: 67,
                    fixedPrice: 150
                }
            },
            {
                id: '4',
                name: 'Kurs Intensywny — Wakacje',
                code: 'KURS',
                type: 'onetime',
                status: 'active',
                icon: '⚡',
                color: 'green',
                description: 'Tygodniowy kurs wakacyjny. Jedna stała cena za cały kurs.',
                invoicePatternB2C: 'FA/KURS/RRRR/MM/NNN',
                invoicePatternB2B: 'FV/B2B/RRRR/MM/NNN',
                firmaId: 'gls-main',
                stats: {
                    studentsCount: 24,
                    invoicesCount: 24,
                    fixedPrice: 350
                }
            }
        ] as Project[],
        currentProject: null as Project | null,
        isLoading: false,
        error: null as string | null
    }),
    getters: {
        activeProjects: (state) => state.projects.filter(p => p.status === 'active'),
        recurringProjects: (state) => state.projects.filter(p => p.type === 'recurring'),
        oneTimeProjects: (state) => state.projects.filter(p => p.type === 'onetime'),
        archivedProjects: (state) => state.projects.filter(p => p.status === 'archive')
    },
    actions: {
        addProject(project: Omit<Project, 'id'>) {
            const id = (this.projects.length + 1).toString();
            this.projects.push({
                ...project,
                id
            } as Project);
        },
        async fetchProject(id: string | number) {
            this.isLoading = true;
            this.error = null;

            try {
                // Имитация задержки API
                await new Promise(resolve => setTimeout(resolve, 800));

                const project = this.projects.find(p => p.id === id.toString());

                if (project) {
                    this.currentProject = { ...project };
                } else {
                    this.error = 'Project not found';
                }
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch project';
            } finally {
                this.isLoading = false;
            }
        }
    }
});
