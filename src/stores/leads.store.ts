import { defineStore } from 'pinia';
import { getRecruitmentApi } from '../api/recruitmentApi';
import type { RecruitmentBackend } from '../api/http';

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
        isLoading: false,
        currentBackend: 'default' as RecruitmentBackend,
    }),
    actions: {
        resolveApi(backend?: RecruitmentBackend) {
            this.currentBackend = backend ?? this.currentBackend;
            return getRecruitmentApi(this.currentBackend);
        },
        async fetchLeads(backend?: RecruitmentBackend) {
            this.isLoading = true;
            try {
                const list = await this.resolveApi(backend).getLeads();
                if (list.length) {
                    this.leads = list;
                }
            } catch {
                // keep local seed data if API is unavailable
            } finally {
                this.isLoading = false;
            }
        },
        async moveLead(leadId: string, newStatus: LeadStatus, backend?: RecruitmentBackend) {
            const lead = this.leads.find(l => l.id === leadId);
            if (lead) {
                lead.status = newStatus;
            }
            try {
                await this.resolveApi(backend).updateLeadStatus(leadId, newStatus);
            } catch {
                // optimistic UI: do not rollback while backend endpoint is integrating
            }
        },
        async addLead(lead: Omit<Lead, 'id'>, backend?: RecruitmentBackend) {
            const localLead: Lead = {
                ...lead,
                id: Math.random().toString(36).substr(2, 9),
            };
            this.leads.push(localLead);
            try {
                await this.resolveApi(backend).createLead(lead);
            } catch {
                // keep local record to avoid blocking UX
            }
        },
        async inviteLead(data: {
            first_name: string;
            surname: string;
            email: string;
            parent_email: string;
            nickname: string;
            phone: string;
            subscription_amount: string | number;
            contract_old_new: string;
            discount?: string | number;
            balance_overpayment?: number;
        }, backend?: RecruitmentBackend) {
            this.isLoading = true;
            try {
                await this.resolveApi(backend).inviteNewStudent(data);
            } finally {
                this.isLoading = false;
            }
        }
    }
});
