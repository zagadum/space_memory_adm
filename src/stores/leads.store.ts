import { defineStore } from 'pinia';

export type LeadStatus = 'new' | 'in_progress' | 'trial' | 'decision';

export interface Lead {
    id: string;
    name: string;
    phone: string;
    subject: string;
    createdAt: string;
    status: LeadStatus;
}

export const useLeadsStore = defineStore('leads', {
    state: () => ({
        leads: [
            { id: '1', name: 'Александр Иванов', phone: '+48 123 456 789', subject: 'Математика', createdAt: '2023-10-20', status: 'new' },
            { id: '2', name: 'Мария Петрова', phone: '+48 987 654 321', subject: 'Физика', createdAt: '2023-10-21', status: 'new' },
            { id: '3', name: 'Дмитрий Сидоров', phone: '+48 500 600 700', subject: 'Английский', createdAt: '2023-10-19', status: 'in_progress' },
            { id: '4', name: 'Елена Смирнова', phone: '+48 111 222 333', subject: 'Химия', createdAt: '2023-10-18', status: 'trial' },
            { id: '5', name: 'Игорь Кузнецов', phone: '+48 444 555 666', subject: 'Биология', createdAt: '2023-10-17', status: 'decision' },
        ] as Lead[],
    }),
    actions: {
        moveLead(leadId: string, newStatus: LeadStatus) {
            const lead = this.leads.find(l => l.id === leadId);
            if (lead) {
                lead.status = newStatus;
            }
        },
        addLead(lead: Omit<Lead, 'id'>) {
            this.leads.push({
                ...lead,
                id: Math.random().toString(36).substr(2, 9),
            });
        }
    }
});
