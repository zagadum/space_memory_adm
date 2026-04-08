import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { salaryApi } from '../api/salaryApi'
import { parseApiError } from '../api/errorHelper'
import { getTeachers } from '../api/teachersApi'

export interface SalaryComponent {
    id: string
    name: string
    amount: number
    details?: string
    subDetails?: string
}

export interface Teacher {
    id: number
    name: string
    role: string
}

type ExcelFormat = 'xlsx' | 'xls'

export const useSalaryCalculatorStore = defineStore('salaryCalculator', () => {
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const status = ref<'draft' | 'confirmed' | 'paid'>('draft')
    const hasCalculation = ref(false)

    const teachers = ref<Teacher[]>([])

    const selectedTeacherId = ref<number | null>(null)
    // Default to current month
    const selectedMonth = ref(new Date().toISOString().slice(0, 7))
    const currentSalaryId = ref<string | number | null>(null)

    // Mock data for Anna Kowalska
    const salaryData = ref({
        subscriptions: 2847.64,
        substitutions: 150.70,
        methodical: 125.60,
        individual: 280.00,
        olympiad: 160.00,
        travel: 0,
        adminDuty: 660.93,
        rezygnacje: 0,
        extraBonus: 215.00, // Dojazd + Premie
        penalties: 0,

        // Trial lessons — rows for proper conversion threshold calculation
        // Each row: attended = total students, won = converted to paid subscribers
        // Salary = 35 zł only if won/attended >= 51% (per business spec)
        trialRows: [
            { attended: 6, won: 4 },  // 66.7% → qualifies → 35 zł
            { attended: 8, won: 3 },  // 37.5% → does NOT qualify → 0 zł
            { attended: 5, won: 3 },  // 60.0% → qualifies → 35 zł
        ] as Array<{ attended: number; won: number }>,

        // Details for Sections
        activeKids: 58,
        graduationPct: 11,
        rezygnacjeBonusPct: 1, // +1% if rezygnacje == 0
    })

    const selectedTeacher = computed(() => {
        return teachers.value.find(t => t.id === selectedTeacherId.value) || { id: 0, name: '—', role: '—' }
    })

    // Calculations
    // Trial lessons: 35 zł per lesson only if conversion rate (won/attended) >= 51%
    const trialLessonsAmount = computed(() => {
        return salaryData.value.trialRows.reduce((sum, row) => {
            const conversion = row.won / row.attended;
            return sum + (conversion >= 0.51 ? 35 : 0);
        }, 0);
    })

    const subtotalBeforeBonus = computed(() => {
        const d = salaryData.value
        return d.subscriptions + d.substitutions + d.methodical + d.individual +
            d.olympiad + d.travel + d.adminDuty + trialLessonsAmount.value + d.extraBonus
    })

    const rezygnacjeBonusAmount = computed(() => {
        if (salaryData.value.rezygnacje === 0) {
            // In the HTML it's roughly 1% of the total base from subscriptions or total?
            // 258.88 is roughly 1% of 25887.60 (Total subscriptions base).
            // Let's stick to the HTML logic: 1% of the total pool from which 11% was taken.
            const basePool = salaryData.value.subscriptions / (salaryData.value.graduationPct / 100)
            return basePool * (salaryData.value.rezygnacjeBonusPct / 100)
        }
        return 0
    })

    const totalPayout = computed(() => {
        return subtotalBeforeBonus.value + rezygnacjeBonusAmount.value - salaryData.value.penalties
    })

    async function loadTeachers() {
        try {
            const response = await getTeachers({ per_page: 200, orderBy: 'lastName', orderDirection: 'asc' })
            teachers.value = response.data.map((item) => ({
                id: item.id,
                name: `${item.firstName} ${item.lastName}`.trim(),
                role: 'Trener',
            }))

            if (!selectedTeacherId.value && teachers.value.length > 0) {
                selectedTeacherId.value = teachers.value[0].id
            }
        } catch (e: unknown) {
            error.value = parseApiError(e, 'Failed to load teachers list')
            teachers.value = []
            selectedTeacherId.value = null
        }
    }

    // Actions
    async function fetchTrainerData(id: number | null, month: string) {
        if (!id) return

        isLoading.value = true
        error.value = null
        currentSalaryId.value = null
        hasCalculation.value = false
        selectedTeacherId.value = id
        selectedMonth.value = month

        try {
            const data = await salaryApi.getTeacherSalary(id, month, 1)

            salaryData.value = {
                subscriptions: data.subscriptions.amount,
                substitutions: data.substitutions.amount,
                methodical: data.methodical.amount,
                individual: data.individual.amount,
                olympiad: data.olympiad.amount,
                travel: 0,
                adminDuty: data.admin3pct.amount,
                rezygnacje: data.rezygnacje.length,
                extraBonus: data.bonuses.amount,
                penalties: 0,
                trialRows: data.trialLessons.rows.map((row) => ({
                    attended: row.attended,
                    won: row.won,
                })),
                activeKids: data.subscriptions.childrenCount,
                graduationPct: data.subscriptions.rate,
                rezygnacjeBonusPct: 1,
            }

            currentSalaryId.value = data.id
            status.value = data.status === 'disputed' ? 'draft' : data.status
            hasCalculation.value = true
        } catch (e: any) {
            // 404 = расчёт не существует ещё → не ошибка, показываем кнопку "Произвести расчёт"
            if (e?.response?.status === 404) {
                hasCalculation.value = false
                error.value = null
            } else {
                error.value = parseApiError(e, 'Failed to fetch data')
                hasCalculation.value = false
            }
        } finally {
            isLoading.value = false
        }
    }

    async function createCalculation() {
        if (!selectedTeacherId.value) return
        // Trigger data fetch — backend will create the record on first GET if it doesn't exist.
        // If a dedicated POST endpoint is added later, replace this with a direct API call.
        await fetchTrainerData(selectedTeacherId.value, selectedMonth.value)
    }

    async function updateStatus(newStatus: 'draft' | 'confirmed' | 'paid') {
        if (newStatus === 'confirmed' && currentSalaryId.value) {
            isLoading.value = true
            error.value = null
            try {
                await salaryApi.confirmSalary(currentSalaryId.value, 1)
                status.value = 'confirmed'
                return
            } catch (e: any) {
                error.value = parseApiError(e, 'Failed to confirm salary')
            } finally {
                isLoading.value = false
            }
        }

        status.value = newStatus
    }

    async function disputeSalary(reason: string) {
        const teacherId = selectedTeacherId.value
        const salaryId = currentSalaryId.value
        const text = reason.trim()

        if (!teacherId || !salaryId || !text) {
            error.value = 'Dispute cannot be sent without teacher, salary and reason.'
            return false
        }

        isLoading.value = true
        error.value = null
        try {
            await salaryApi.disputeSalary(salaryId, teacherId, text, 1)
            status.value = 'draft'
            await fetchTrainerData(teacherId, selectedMonth.value)
            return true
        } catch (e: unknown) {
            error.value = parseApiError(e, 'Failed to send dispute')
            return false
        } finally {
            isLoading.value = false
        }
    }
    function doExport(t: any, format: ExcelFormat = 'xlsx') {
        const rows: any[] = []
        const d = salaryData.value

        // Mapping logic with translations
        rows.push({
            category: t('salaryCalc.components.subscriptions'),
            description: `${t('salaryCalc.labels.activeKids')}: ${d.activeKids}, ${t('salaryCalc.labels.graduation')}: ${d.graduationPct}%`,
            rateQty: `${d.graduationPct}%`,
            amount: d.subscriptions
        })

        if (d.substitutions > 0) {
            rows.push({
                category: t('salaryCalc.components.substitutions'),
                description: '',
                rateQty: '-',
                amount: d.substitutions
            })
        }

        if (d.methodical > 0) {
            rows.push({
                category: t('salaryCalc.components.methodical'),
                description: '',
                rateQty: '-',
                amount: d.methodical
            })
        }

        if (d.individual > 0) {
            rows.push({
                category: t('salaryCalc.components.individual'),
                description: '',
                rateQty: '-',
                amount: d.individual
            })
        }

        if (d.olympiad > 0) {
            rows.push({
                category: t('salaryCalc.components.olympiad'),
                description: '',
                rateQty: '-',
                amount: d.olympiad
            })
        }

        if (d.adminDuty > 0) {
            rows.push({
                category: t('salaryCalc.components.adminDuty'),
                description: '',
                rateQty: '3%',
                amount: d.adminDuty
            })
        }

        if (trialLessonsAmount.value > 0) {
            rows.push({
                category: t('salaryCalc.components.trial'),
                description: '',
                rateQty: '-',
                amount: trialLessonsAmount.value
            })
        }

        if (rezygnacjeBonusAmount.value > 0) {
            rows.push({
                category: t('salaryCalc.components.retention'),
                description: '',
                rateQty: '+1%',
                amount: rezygnacjeBonusAmount.value
            })
        }

        if (d.extraBonus > 0) {
            rows.push({
                category: t('salaryCalc.components.extra'),
                description: '',
                rateQty: '-',
                amount: d.extraBonus
            })
        }

        if (d.penalties > 0) {
            rows.push({
                category: t('salaryCalc.components.penalties') || 'Penalties',
                description: '',
                rateQty: '-',
                amount: -d.penalties
            })
        }

        const dateStr = new Date().toISOString().split('T')[0]
        const fileName = `Salary_Export_${selectedTeacher.value.name}_${selectedMonth.value}_${dateStr}`

        import('../utils/excelExport').then(({ exportSalaryToExcel }) => {
            exportSalaryToExcel(fileName, rows, totalPayout.value, t, format)
        })
    }

    return {
        isLoading,
        error,
        status,
        teachers,
        selectedTeacherId,
        selectedMonth,
        salaryData,
        selectedTeacher,
        trialLessonsAmount,
        subtotalBeforeBonus,
        rezygnacjeBonusAmount,
        totalPayout,
        loadTeachers,
        hasCalculation,
        fetchTrainerData,
        createCalculation,
        updateStatus,
        disputeSalary,
        doExport
    }
})
