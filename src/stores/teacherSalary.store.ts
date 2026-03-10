import { defineStore } from 'pinia';
import { salaryApi } from '../api/salaryApi';

const DEFAULT_TEACHER_ID = 1;
const DEFAULT_PROJECT_ID = 1;

export interface Child {
    name: string;
    abon: number;
    abonFinal?: number;
    abonNote?: string;
    discounts: Array<{ type: string; label: string }>;
    lessons: number[];
    status: 'paid' | 'overdue' | 'pending';
    conducted: number;
}

export interface Group {
    name: string;
    day: string;
    kids: number;
    base: number;
    salary: number;
    children: Child[];
}

export interface SalaryData {
    id: string;
    month: string;
    trainerName: string;
    status: 'draft' | 'confirmed' | 'paid' | 'disputed';
    confirmedAt: string | null;

    subscriptions: {
        amount: number;
        base: number;
        rate: number;
        childrenCount: number;
        groups: Group[];
    };

    substitutions: {
        amount: number;
        rows: Array<{
            child: string;
            group: string;
            forTrainer: string;
            date: string;
            abon: number;
            salary: number;
        }>;
    };

    methodical: {
        amount: number;
        rate: number;
        rows: Array<{
            name: string;
            date: string;
            present: boolean;
            hours: number;
            total: number;
        }>;
    };

    individual: {
        amount: number;
        rate: number;
        rows: Array<{
            child: string;
            program: string;
            count: number;
            total: number;
        }>;
    };

    olympiad: {
        amount: number;
        rate: number;
        rows: Array<{
            name: string;
            date: string;
            link: string;
            total: number;
        }>;
    };

    admin3pct: {
        amount: number;
        base: number;
        pct: number;
        evaluatedBy: string;
        evaluatedAt: string;
        checklist: Array<{
            duty: string;
            status: 'done' | 'partial' | 'fail';
            comment: string | null;
        }>;
    };

    bonuses: {
        amount: number;
        rows: Array<{
            reason: string;
            comment: string;
            status: 'approved' | 'pending';
            total: number;
        }>;
    };

    trialLessons: {
        amount: number;
        rate: number;
        threshold: number;
        confirmedByQA: boolean;
        confirmedBy: string;
        confirmedAt: string;
        rows: Array<{
            name: string;
            date: string;
            program: string;
            attended: number;
            won: number;
            paid: boolean;
            salary: number;
            children: Array<{ name: string; status: 'won' | 'lost' }>;
        }>;
    };

    rezygnacje: Array<{
        name: string;
        date: string;
        reason: string;
    }>;
}

export const useTeacherSalaryStore = defineStore('teacherSalary', {
    state: () => ({
        salaryData: {
            id: 's_1',
            month: '2026-02',
            trainerName: 'Anna Kowalska',
            status: 'draft',
            confirmedAt: null,

            subscriptions: {
                amount: 2847.64,
                base: 25887.60,
                rate: 11,
                childrenCount: 58,
                groups: [
                    {
                        name: 'SM-01', day: 'вт 17:00', kids: 16, base: 7840, salary: 862.40,
                        children: [
                            { name: 'Kowalczyk Marta', abon: 490, discounts: [], lessons: [1, 1, 1, 1], status: 'paid', conducted: 4 },
                            { name: 'Nowak Adam', abon: 490, discounts: [], lessons: [1, 1, 1, 1], status: 'paid', conducted: 4 },
                            { name: 'Wiśniewska Zofia', abon: 490, discounts: [], lessons: [1, 1, 0, 1], status: 'paid', conducted: 4 },
                            { name: 'Zielińska Hanna', abon: 490, discounts: [{ type: 'family', label: '−10% родина' }], lessons: [1, 1, 1, 1], status: 'paid', conducted: 4, abonFinal: 441 },
                            { name: 'Woźniak Lena', abon: 490, discounts: [{ type: 'promo', label: '−5% промо' }], lessons: [1, 1, 1, 1], status: 'paid', conducted: 4, abonFinal: 465.50 }
                        ]
                    },
                    {
                        name: 'SM-02', day: 'сб 10:00', kids: 14, base: 6860, salary: 754.60,
                        children: [
                            { name: 'Grabowski Aleks', abon: 490, discounts: [], lessons: [1, 1, 1, 1], status: 'paid', conducted: 4 },
                            { name: 'Rutkowska Nadia', abon: 490, discounts: [{ type: 'individual', label: 'індив. 440 zł' }], lessons: [1, 1, 1, 1], status: 'paid', conducted: 4, abonFinal: 440 }
                        ]
                    },
                    { name: 'SM-05', day: 'пт 18:30', kids: 12, base: 5880, salary: 646.80, children: [] },
                    { name: 'SI-03', day: 'пн 16:00', kids: 10, base: 3900, salary: 429.00, children: [] },
                    { name: 'SI-07', day: 'ср 15:00', kids: 6, base: 1407.60, salary: 154.84, children: [] }
                ]
            },

            substitutions: {
                amount: 150.70,
                rows: [
                    { child: 'Kowalczyk Marta', group: 'SM-05 · пт 18:30', forTrainer: 'Zofia Nowak', date: '07.02.2026', abon: 490, salary: 53.90 },
                    { child: 'Nowak Oliwia', group: 'SM-05 · пт 18:30', forTrainer: 'Zofia Nowak', date: '07.02.2026', abon: 490, salary: 53.90 },
                    { child: 'Wojciechowska Anna', group: 'SI-07 · ср 15:00', forTrainer: 'Marek Wójcik', date: '21.02.2026', abon: 390, salary: 42.90 }
                ]
            },

            methodical: {
                amount: 125.60,
                rate: 31.40,
                rows: [
                    { name: 'Методична зустріч — загальна', date: '05.02.2026', present: true, hours: 2, total: 62.80 },
                    { name: 'Методична зустріч — Space Memory', date: '19.02.2026', present: true, hours: 2, total: 62.80 },
                    { name: 'Методична зустріч — INDIGO', date: '12.02.2026', present: false, hours: 0, total: 0 }
                ]
            },

            individual: {
                amount: 280.00,
                rate: 40,
                rows: [
                    { child: 'Zielińska Weronika', program: 'Space Memory', count: 4, total: 160 },
                    { child: 'Szymański Bartosz', program: 'INDIGO', count: 3, total: 120 }
                ]
            },

            olympiad: {
                amount: 160.00,
                rate: 40,
                rows: [
                    { name: 'Тиждень 1', date: '03.02.2026', link: 'zoom.us/rec/AB12…', total: 40 },
                    { name: 'Тиждень 2', date: '10.02.2026', link: 'zoom.us/rec/CD34…', total: 40 },
                    { name: 'Тиждень 3', date: '17.02.2026', link: 'zoom.us/rec/EF56…', total: 40 },
                    { name: 'Тиждень 4', date: '24.02.2026', link: 'zoom.us/rec/GH78…', total: 40 }
                ]
            },

            admin3pct: {
                amount: 660.93,
                base: 25887.60,
                pct: 85,
                evaluatedBy: 'Magdalena Wiśniewska (DJ)',
                evaluatedAt: '01.03.2026',
                checklist: [
                    { duty: '🎥 Записи уроків — всі відправлені', status: 'done', comment: null },
                    { duty: '📋 Підсумки занять — всі заповнені', status: 'done', comment: null },
                    { duty: '✅ Заліки проведені та завантажені', status: 'partial', comment: 'Не завантажено 2 залікових відео (SM-02, SM-03). Тренеру потрібно було завантажити до 25.02 — завантажено лише 4 з 6.' },
                    { duty: '📚 Домашня робота завантажена вчасно', status: 'done', comment: null },
                    { duty: '📱 WhatsApp-огляди відправлені', status: 'done', comment: null },
                    { duty: '👨‍👩‍👧 Зв\'язок з батьками — зворотний зв\'язок', status: 'partial', comment: '3 батьки (Nowak, Kowalski, Wiśniewski) не отримали зворотного зв\'язку у лютому.' },
                    { duty: '📄 Короткі огляди відправлені', status: 'done', comment: null }
                ]
            },

            bonuses: {
                amount: 500.00,
                rows: [
                    { reason: 'Результати учнів на олімпіаді', comment: '2 призових місця на міській олімпіаді SM', status: 'approved', total: 500 }
                ]
            },

            trialLessons: {
                amount: 70.00,
                rate: 35,
                threshold: 51,
                confirmedByQA: true,
                confirmedBy: 'Magdalena Wiśniewska (DJ)',
                confirmedAt: '01.03.2026',
                rows: [
                    {
                        name: 'Пробний SM', date: '08.02.2026', program: 'Space Memory', attended: 6, won: 4, paid: true, salary: 35,
                        children: [
                            { name: 'Górska Emilia', status: 'won' },
                            { name: 'Sobieski Tomasz', status: 'lost' }
                        ]
                    },
                    {
                        name: 'Пробний SM', date: '15.02.2026', program: 'Space Memory', attended: 8, won: 3, paid: false, salary: 0,
                        children: []
                    },
                    {
                        name: 'Пробний INDIGO', date: '22.02.2026', program: 'INDIGO', attended: 5, won: 3, paid: true, salary: 35,
                        children: []
                    }
                ]
            },

            rezygnacje: []
        } as SalaryData | null,
        isLoading: false,
        error: null as string | null
    }),

    getters: {
        // We might want to compute active sections for the summary grid
        activeSections: (state) => {
            if (!state.salaryData) return [];
            const d = state.salaryData;
            const sections = [];
            if (d.subscriptions.amount > 0) sections.push({ label: 'teacherSalary.sections.subscriptions', amount: d.subscriptions.amount, type: 'subscription', subtext: `${d.subscriptions.childrenCount} kids · ${d.subscriptions.rate}%` });
            if (d.substitutions.amount > 0) sections.push({ label: 'teacherSalary.sections.substitutions', amount: d.substitutions.amount, type: 'replacement', subtext: `${d.substitutions.rows.length} replacements` });
            if (d.methodical.amount > 0) sections.push({ label: 'teacherSalary.sections.methodical', amount: d.methodical.amount, type: 'meetings', subtext: `${d.methodical.rows.filter(r => r.present).length} attended` });
            if (d.individual.amount > 0) sections.push({ label: 'teacherSalary.sections.individual', amount: d.individual.amount, type: 'individual', subtext: `${d.individual.rows.length} pupils` });
            if (d.olympiad.amount > 0) sections.push({ label: 'teacherSalary.sections.olympiad', amount: d.olympiad.amount, type: 'olympiad', subtext: `${d.olympiad.rows.length} lessons` });
            if (d.admin3pct.amount > 0) sections.push({ label: 'teacherSalary.sections.admin3pct', amount: d.admin3pct.amount, type: 'admin', subtext: `QA Score: ${d.admin3pct.pct}%` });
            if (d.bonuses.amount > 0) sections.push({ label: 'teacherSalary.sections.bonuses', amount: d.bonuses.amount, type: 'bonus', subtext: `${d.bonuses.rows.length} positions` });

            // Trial lessons with calculated amount
            const trialAmount = d.trialLessons.rows.reduce((sum, row) => {
                const conversion = row.won / row.attended;
                return sum + (conversion >= 0.51 ? 35 : 0);
            }, 0);
            if (trialAmount > 0) {
                sections.push({ label: 'teacherSalary.sections.trialLessons', amount: trialAmount, type: 'trial', subtext: `${d.trialLessons.rows.filter(r => (r.won / r.attended) >= 0.51).length} qualified` });
            }

            // Retention Bonus (+1%)
            if (d.rezygnacje.length === 0) {
                const bonus = d.subscriptions.base * 0.01;
                sections.push({ label: 'teacherSalary.sections.retentionBonus', amount: bonus, type: 'bonus', subtext: '0 rezygnacji (+1%)' });
            }

            return sections;
        },

        totalPayout: (state) => {
            if (!state.salaryData) return 0;
            const d = state.salaryData;

            const trialAmount = d.trialLessons.rows.reduce((sum, row) => {
                const conversion = row.won / row.attended;
                return sum + (conversion >= 0.51 ? 35 : 0);
            }, 0);

            const retentionBonus = d.rezygnacje.length === 0 ? d.subscriptions.base * 0.01 : 0;

            return d.subscriptions.amount +
                d.substitutions.amount +
                d.methodical.amount +
                d.individual.amount +
                d.olympiad.amount +
                d.admin3pct.amount +
                d.bonuses.amount +
                trialAmount +
                retentionBonus;
        }
    },

    actions: {
        async fetchSalary(month: string) {
            this.isLoading = true;
            this.error = null;
            try {
                const data = await salaryApi.getTeacherSalary(DEFAULT_TEACHER_ID, month, DEFAULT_PROJECT_ID);
                this.salaryData = data;
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch salary data';
            } finally {
                this.isLoading = false;
            }
        },

        async confirmSalary() {
            if (!this.salaryData) return;
            this.isLoading = true;
            try {
                const response = await salaryApi.confirmSalary(this.salaryData.id, DEFAULT_PROJECT_ID);
                this.salaryData.status = response.status as 'draft' | 'confirmed' | 'paid' | 'disputed';
                this.salaryData.confirmedAt = response.confirmedAt;
            } finally {
                this.isLoading = false;
            }
        },

        async disputeSalary(reason: string) {
            if (!this.salaryData) return;
            this.isLoading = true;
            this.error = null;
            try {
                const response = await salaryApi.disputeSalary(this.salaryData.id, DEFAULT_TEACHER_ID, reason, DEFAULT_PROJECT_ID);
                this.salaryData.status = response.status as 'draft' | 'confirmed' | 'paid' | 'disputed';
            } catch (err: any) {
                this.error = err.message || 'Failed to dispute salary';
            } finally {
                this.isLoading = false;
            }
        },

        async exportToExcel(t: any) {
            if (!this.salaryData) return;
            const rows: any[] = [];
            const d = this.salaryData;

            // Simplified mapping for the teacher view based on their sections
            const activeSections = [
                { id: 'subscriptions', amount: d.subscriptions.amount },
                { id: 'substitutions', amount: d.substitutions.amount },
                { id: 'methodical', amount: d.methodical.amount },
                { id: 'individual', amount: d.individual.amount },
                { id: 'olympiad', amount: d.olympiad.amount },
                { id: 'bonuses', amount: d.bonuses.amount },
                { id: 'admin3pct', amount: d.admin3pct.amount }
            ].filter(s => s.amount > 0);

            activeSections.forEach(sec => {
                rows.push({
                    category: t(`teacherSalary.sections.${sec.id}`),
                    description: '',
                    rateQty: '-',
                    amount: sec.amount
                });
            });

            // Retention Bonus (+1%)
            if (d.rezygnacje.length === 0) {
                const bonus = d.subscriptions.base * 0.01;
                rows.push({
                    category: t('teacherSalary.sections.retentionBonus') || 'Bonus (Retention)',
                    description: '0 rezygnacji (+1%)',
                    rateQty: '+1%',
                    amount: bonus
                });
            }

            const trialAmount = d.trialLessons.rows.reduce((sum, row) => {
                const conversion = row.won / row.attended;
                return sum + (conversion >= 0.51 ? 35 : 0);
            }, 0);

            if (trialAmount > 0) {
                rows.push({
                    category: t('teacherSalary.sections.trialLessons'),
                    description: '',
                    rateQty: '-',
                    amount: trialAmount
                });
            }

            const dateStr = new Date().toISOString().split('T')[0];
            const fileName = `Salary_Export_${d.trainerName}_${d.month}_${dateStr}.xlsx`;

            const { exportSalaryToExcel } = await import('../utils/excelExport');
            exportSalaryToExcel(fileName, rows, this.totalPayout, t);
        }
    }
});
