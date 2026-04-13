import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { salaryApi, type SalaryHistoryItem } from '../api/salaryApi'
import { parseApiError } from '../api/errorHelper'
import { getTeachers } from '../api/teachersApi'


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
    const rawSalary = ref<any | null>(null)
    const historyItems = ref<SalaryHistoryItem[]>([])

    // Salary component breakdown — populated from API after calculation is loaded/created
    const salaryData = ref({
        subscriptions: 0,
        substitutions: 0,
        methodical: 0,
        individual: 0,
        olympiad: 0,
        travel: 0,
        adminDuty: 0,
        trialLessons: 0,
        retentionBonus: 0,
        rezygnacje: 0,
        extraBonus: 0,
        penalties: 0,
        total: 0,
        trialRows: [] as Array<{ attended: number; won: number }>,
        activeKids: 0,
        graduationPct: 0,
        rezygnacjeBonusPct: 1,
    })

    const selectedTeacher = computed(() => {
        return teachers.value.find(t => t.id === selectedTeacherId.value) || { id: 0, name: '—', role: '—' }
    })

    const normalizedSections = computed(() => rawSalary.value?.sections ?? [])
    const subscriptionGroups = computed(() => rawSalary.value?.subscriptions?.groups ?? [])
    const confirmationHistory = computed(() => historyItems.value.length ? historyItems.value : (rawSalary.value?.confirmations ?? []))

    // Calculations
    // Trial lessons: 35 zł per lesson only if conversion rate (won/attended) >= 51%
    const trialLessonsAmount = computed(() => {
        if (salaryData.value.trialLessons > 0) {
            return salaryData.value.trialLessons
        }

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
        if (salaryData.value.retentionBonus > 0 || salaryData.value.rezygnacje > 0) {
            return salaryData.value.retentionBonus
        }

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
        return salaryData.value.total || (subtotalBeforeBonus.value + rezygnacjeBonusAmount.value - salaryData.value.penalties)
    })

    function applySalaryResponse(data: any) {
        rawSalary.value = data
        historyItems.value = data.confirmations ?? []

        // pctSubscriptions is the actual trainer payout from subscriptions
        const pctSubs = data.totals?.pctSubscriptions ?? data.subscriptions?.amount ?? 0
        // bonuses_amount = rekompensata + dojazd; travel is separated in compatibility layer
        const bonuses = data.totals?.bonuses ?? data.bonuses?.amount ?? 0
        const rezygnacjeArr = Array.isArray(data.rezygnacje) ? data.rezygnacje : []

        salaryData.value = {
            subscriptions: pctSubs,
            substitutions: data.totals?.substitutions ?? data.substitutions?.amount ?? 0,
            methodical:    data.totals?.methodical    ?? data.methodical?.amount    ?? 0,
            individual:    data.totals?.individual    ?? data.individual?.amount    ?? 0,
            olympiad:      data.totals?.olympiad      ?? data.olympiad?.amount      ?? 0,
            // dojazd is included in bonuses_amount; keep travel=0 to avoid double-count
            travel:        0,
            adminDuty:     data.totals?.adminDuty     ?? data.admin3pct?.amount     ?? 0,
            trialLessons:  data.totals?.trialLessons  ?? data.trialLessons?.amount  ?? 0,
            retentionBonus: data.totals?.retentionBonus ?? 0,
            rezygnacje:    rezygnacjeArr.length,
            extraBonus:    bonuses,
            penalties:     data.penalties?.amount ?? 0,
            total:         data.total ?? 0,
            trialRows: (data.trialLessons?.rows ?? []).map((row: any) => ({
                attended: row.attended ?? 0,
                won:      row.won      ?? 0,
            })),
            activeKids:   data.subscriptions?.childrenCount ?? 0,
            graduationPct: data.subscriptions?.rate ?? 0,
            rezygnacjeBonusPct: 1,
        }

        currentSalaryId.value = data.id
        status.value = data.status === 'disputed' ? 'draft' : (data.status ?? 'draft')
        hasCalculation.value = true
    }

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
            applySalaryResponse(data)
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
        isLoading.value = true
        error.value = null
        try {
            const data = await salaryApi.recalculateSalary(selectedTeacherId.value, selectedMonth.value, 1)
            applySalaryResponse(data)
        } catch (e: unknown) {
            error.value = parseApiError(e, 'Failed to create calculation')
        } finally {
            isLoading.value = false
        }
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

            if (selectedTeacherId.value) {
                await fetchTrainerData(selectedTeacherId.value, selectedMonth.value)
            }

            return
        }

        if (newStatus === 'paid' && currentSalaryId.value) {
            isLoading.value = true
            error.value = null
            try {
                await salaryApi.markSalaryPaid(currentSalaryId.value, selectedTeacherId.value ?? undefined, 1)
                status.value = 'paid'
            } catch (e: any) {
                error.value = parseApiError(e, 'Failed to mark salary as paid')
            } finally {
                isLoading.value = false
            }

            if (selectedTeacherId.value) {
                await fetchTrainerData(selectedTeacherId.value, selectedMonth.value)
            }

            return
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
        rawSalary,
        normalizedSections,
        subscriptionGroups,
        confirmationHistory,
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
