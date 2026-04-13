import { defineStore } from 'pinia';
import { salaryApi } from '../api/salaryApi';
import { parseApiError } from '../api/errorHelper';
import { useAuthStore } from './auth.store';

type ExcelFormat = 'xlsx' | 'xls';

const SECTION_EXPORT_KEY_MAP: Record<string, string> = {
    subscriptions: 'subscriptions',
    substitutions: 'substitutions',
    methodology_meetings: 'methodical',
    individual_lessons: 'individual',
    olympiad_lessons: 'olympiad',
    admin_duty: 'admin3pct',
    trial_lessons: 'trialLessons',
    retention_bonus: 'retentionBonus',
    rekompensata: 'bonuses',
    dojazd: 'bonuses',
    kara_umowna: 'Штрафы',
};

interface SalarySectionDto {
    id: number;
    key: string;
    title: string;
    amount: number;
    sign: 'add' | 'subtract';
    sortOrder: number;
    isVisible: boolean;
    meta: Record<string, unknown>;
}

export interface SalaryHistoryItemDto {
    id: number;
    action: string;
    actorRole?: string | null;
    comment: string | null;
    createdAt: string | null;
}

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
    paidAt?: string | null;
    calculatedAt?: string | null;
    total: number;
    sections?: SalarySectionDto[];
    subscriptionItems?: Array<Record<string, unknown>>;
    confirmations?: SalaryHistoryItemDto[];

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
            const keyMap: Record<string, { label: string; type: string; subtext?: string }> = {
                subscriptions: { label: 'teacherSalary.sections.subscriptions', type: 'subscription', subtext: `${d.subscriptions.childrenCount} kids · ${d.subscriptions.rate}%` },
                substitutions: { label: 'teacherSalary.sections.substitutions', type: 'replacement', subtext: `${d.substitutions.rows.length} replacements` },
                methodology_meetings: { label: 'teacherSalary.sections.methodical', type: 'meetings', subtext: `${d.methodical.rows.filter(r => r.present).length} attended` },
                individual_lessons: { label: 'teacherSalary.sections.individual', type: 'individual', subtext: `${d.individual.rows.length} pupils` },
                olympiad_lessons: { label: 'teacherSalary.sections.olympiad', type: 'olympiad', subtext: `${d.olympiad.rows.length} lessons` },
                admin_duty: { label: 'teacherSalary.sections.admin3pct', type: 'admin', subtext: `QA Score: ${d.admin3pct.pct}%` },
                trial_lessons: { label: 'teacherSalary.sections.trialLessons', type: 'trial', subtext: `${d.trialLessons.rows.filter(r => r.paid).length} qualified` },
                retention_bonus: { label: 'teacherSalary.sections.retentionBonus', type: 'bonus', subtext: '0 rezygnacji (+1%)' },
                rekompensata: { label: 'teacherSalary.sections.bonuses', type: 'bonus', subtext: `${d.bonuses.rows.length} positions` },
                dojazd: { label: 'teacherSalary.sections.bonuses', type: 'bonus', subtext: `${d.bonuses.rows.length} positions` },
                kara_umowna: { label: 'Штрафы', type: 'rezygnacje', subtext: 'Penalty' },
            };

            if (Array.isArray(d.sections) && d.sections.length > 0) {
                return d.sections
                    .filter(section => section.isVisible)
                    .map(section => {
                        const mapped = keyMap[section.key] ?? { label: 'teacherSalary.pageTitle', type: 'bonus', subtext: section.title };
                        return {
                            label: mapped.label,
                            amount: section.sign === 'subtract' ? -section.amount : section.amount,
                            type: mapped.type,
                            subtext: mapped.subtext ?? section.title,
                        };
                    });
            }

            return [];
        },

        totalPayout: (state) => {
            if (!state.salaryData) return 0;
            return state.salaryData.total;
        }
    },

    actions: {
        async fetchSalary(month: string) {
            // Берём teacherId из auth store, fallback = 1
            const authStore = useAuthStore();
            const teacherId = authStore.user?.teacherId ?? (Number(authStore.user?.id) || 1);
            const projectId = 1; // TODO: брать из выбранного проекта

            this.isLoading = true;
            this.error = null;
            try {
                this.salaryData = await salaryApi.getTeacherSalary(teacherId, month, projectId);
            } catch (err: unknown) {
                this.error = parseApiError(err, 'Ошибка загрузки зарплаты');
                const errObj = err as any;
                // 404 — расчёт ещё не создан за этот месяц
                if (errObj?.response?.status === 404) {
                    this.error = 'Расчёт зарплаты за этот месяц ещё не создан.';
                }
                // 422 — некорректный формат месяца
                if (errObj?.response?.status === 422) {
                    const validationErrors = errObj?.response?.data?.errors;
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
            } catch (err: unknown) {
                const msg = parseApiError(err, 'Ошибка подтверждения');
                this.error = msg;
                notify.addToast(msg, 'error');
                const errObj = err as any;
                if (errObj?.response?.status === 404) {
                    this.error = 'Расчёт не найден. Обновите страницу.';
                }
            } finally {
                this.isLoading = false;
            }
        },

        async disputeSalary(reason: string) {
            if (!this.salaryData) return;
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
                await salaryApi.disputeSalary(
                    this.salaryData.id,
                    teacherId,
                    reason
                );
                // response.status = 'disputed' (статус спора, не расчёта)
                // Но бэкенд меняет статус расчёта тоже на 'disputed'
                this.salaryData.status = 'disputed';
                notify.addToast('Спор отправлен ⚠️', 'warning');
            } catch (err: unknown) {
                const msg = parseApiError(err, 'Ошибка при отправке спора');
                const errObj = err as any;
                if (errObj?.response?.status === 422) {
                    const validationErrors = errObj?.response?.data?.errors;
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

        async exportToExcel(t: any, format: ExcelFormat = 'xlsx') {
            if (!this.salaryData) return;
            const rows: any[] = [];
            const d = this.salaryData;

            const activeSections = [
                ...(d.sections ?? []).filter(section => section.isVisible).map(section => ({
                    id: SECTION_EXPORT_KEY_MAP[section.key] ?? section.key,
                    amount: section.sign === 'subtract' ? -section.amount : section.amount,
                }))
            ];

            activeSections.forEach(sec => {
                rows.push({
                    category: t(`teacherSalary.sections.${sec.id}`),
                    description: '',
                    rateQty: '-',
                    amount: sec.amount
                });
            });


            const dateStr = new Date().toISOString().split('T')[0];
            const fileName = `Salary_Export_${d.trainerName}_${d.month}_${dateStr}`;

            const { exportSalaryToExcel } = await import('../utils/excelExport');
            exportSalaryToExcel(fileName, rows, this.totalPayout, t, format);
        }
    }
});
