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
    teacherId?: number;    // приходит с бэкенда, нужен для dispute
    projectId?: number;
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
        salaryData: null as SalaryData | null,
        isLoading: false,
        error: null as string | null,
    }),

    getters: {
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

            const trialAmount = d.trialLessons.rows.reduce((sum, row) => {
                const conversion = row.won / row.attended;
                return sum + (conversion >= 0.51 ? 35 : 0);
            }, 0);
            if (trialAmount > 0) {
                sections.push({ label: 'teacherSalary.sections.trialLessons', amount: trialAmount, type: 'trial', subtext: `${d.trialLessons.rows.filter(r => (r.won / r.attended) >= 0.51).length} qualified` });
            }

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
            // Берём teacherId из auth store, fallback = 1
            const { useAuthStore } = await import('./auth.store');
            const authStore = useAuthStore();
            const teacherId = authStore.user?.teacherId ?? (Number(authStore.user?.id) || 1);
            const projectId = 1; // TODO: брать из выбранного проекта

            this.isLoading = true;
            this.error = null;
            try {
                const data = await salaryApi.getTeacherSalary(teacherId, month, projectId);
                this.salaryData = data;
            } catch (err: any) {
                const msg = err?.response?.data?.message || err?.message || 'Ошибка загрузки зарплаты';
                this.error = msg;
                // 404 — расчёт ещё не создан за этот месяц
                if (err?.response?.status === 404) {
                    this.error = 'Расчёт зарплаты за этот месяц ещё не создан.';
                }
                // 422 — некорректный формат месяца
                if (err?.response?.status === 422) {
                    const validationErrors = err?.response?.data?.errors;
                    this.error = validationErrors
                        ? Object.values(validationErrors).flat().join(' ')
                        : 'Некорректные данные запроса.';
                }
            } finally {
                this.isLoading = false;
            }
        },

        async confirmSalary() {
            if (!this.salaryData) return;
            const { useNotificationStore } = await import('./notification.store');
            const notify = useNotificationStore();

            this.isLoading = true;
            this.error = null;
            try {
                const response = await salaryApi.confirmSalary(this.salaryData.id);
                this.salaryData.status = response.status as SalaryData['status'];
                this.salaryData.confirmedAt = response.confirmedAt;
                notify.addToast('Расчёт подтверждён ✅', 'success');
            } catch (err: any) {
                const msg = err?.response?.data?.message || 'Ошибка подтверждения';
                this.error = msg;
                notify.addToast(msg, 'error');
                if (err?.response?.status === 404) {
                    this.error = 'Расчёт не найден. Обновите страницу.';
                }
            } finally {
                this.isLoading = false;
            }
        },

        async disputeSalary(reason: string) {
            if (!this.salaryData) return;
            const { useAuthStore } = await import('./auth.store');
            const { useNotificationStore } = await import('./notification.store');
            const authStore = useAuthStore();
            const notify = useNotificationStore();

            // teacherId обязателен для dispute endpoint
            const teacherId = this.salaryData.teacherId
                ?? authStore.user?.teacherId
                ?? (Number(authStore.user?.id) || 1);

            this.isLoading = true;
            this.error = null;
            try {
                const response = await salaryApi.disputeSalary(
                    this.salaryData.id,
                    teacherId,
                    reason
                );
                // response.status = 'disputed' (статус спора, не расчёта)
                // Но бэкенд меняет статус расчёта тоже на 'disputed'
                this.salaryData.status = 'disputed';
                notify.addToast('Спор отправлен ⚠️', 'warning');
            } catch (err: any) {
                const msg = err?.response?.data?.message || 'Ошибка при отправке спора';
                if (err?.response?.status === 422) {
                    const validationErrors = err?.response?.data?.errors;
                    this.error = validationErrors
                        ? Object.values(validationErrors).flat().join(' ')
                        : msg;
                } else {
                    this.error = msg;
                }
                notify.addToast(this.error || msg, 'error');
            } finally {
                this.isLoading = false;
            }
        },

        async exportToExcel(t: any) {
            if (!this.salaryData) return;
            const rows: any[] = [];
            const d = this.salaryData;

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
