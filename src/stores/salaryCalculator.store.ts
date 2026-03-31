import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface SalaryComponent {
    id: string
    name: string
    amount: number
    details?: string
    subDetails?: string
}

export interface Teacher {
    id: string
    name: string
    role: string
}

type ExcelFormat = 'xlsx' | 'xls'

export const useSalaryCalculatorStore = defineStore('salaryCalculator', () => {
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const status = ref<'draft' | 'confirmed' | 'paid'>('draft')

    const teachers = ref<Teacher[]>([
        { id: 'anna', name: 'Anna Kowalska', role: 'Trener Space Memory' },
        { id: 'marek', name: 'Marek Wójcik', role: 'Trener Space Memory' },
        { id: 'jan', name: 'Jan Kowalski', role: 'Trener Indigo' }
    ])

    const selectedTeacherId = ref('anna')
    const selectedMonth = ref('2026-02')

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
        return teachers.value.find(t => t.id === selectedTeacherId.value) || teachers.value[0]
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

    // Actions
    async function fetchTrainerData(id: string, month: string) {
        isLoading.value = true
        error.value = null
        try {
            // TODO: replace mock below with real API call when backend is ready:
            // const data = await salaryApi.getTrainerData(id, month);
            // salaryData.value = mapApiResponseToSalaryData(data);
            await new Promise(resolve => setTimeout(resolve, 600))
            selectedTeacherId.value = id
            selectedMonth.value = month

            // Update mock data based on teacher — full replacement to avoid data mixing
            if (id === 'marek') {
                salaryData.value = {
                    subscriptions: 2100.50,
                    substitutions: 80.00,
                    methodical: 62.80,
                    individual: 0,
                    olympiad: 0,
                    travel: 100,
                    adminDuty: 500,
                    rezygnacje: 2, // has rezygnacje → no retention bonus
                    extraBonus: 0,
                    penalties: 0,
                    trialRows: [
                        { attended: 5, won: 2 }, // 40% → does NOT qualify
                        { attended: 4, won: 1 }, // 25% → does NOT qualify
                    ],
                    activeKids: 42,
                    graduationPct: 11,
                    rezygnacjeBonusPct: 1,
                }
            } else if (id === 'jan') {
                salaryData.value = {
                    subscriptions: 1850.00,
                    substitutions: 0,
                    methodical: 62.80,
                    individual: 120.00,
                    olympiad: 80.00,
                    travel: 0,
                    adminDuty: 420.00,
                    rezygnacje: 0,
                    extraBonus: 100.00,
                    penalties: 0,
                    trialRows: [
                        { attended: 6, won: 4 }, // 66.7% → qualifies → 35 zł
                    ],
                    activeKids: 35,
                    graduationPct: 11,
                    rezygnacjeBonusPct: 1,
                }
            } else {
                // Reset to Anna defaults
                salaryData.value = {
                    subscriptions: 2847.64,
                    substitutions: 150.70,
                    methodical: 125.60,
                    individual: 280.00,
                    olympiad: 160.00,
                    travel: 0,
                    adminDuty: 660.93,
                    rezygnacje: 0,
                    extraBonus: 215.00,
                    penalties: 0,
                    trialRows: [
                        { attended: 6, won: 4 },
                        { attended: 8, won: 3 },
                        { attended: 5, won: 3 },
                    ],
                    activeKids: 58,
                    graduationPct: 11,
                    rezygnacjeBonusPct: 1,
                }
            }
        } catch (e: any) {
            error.value = e.message || 'Failed to fetch data'
        } finally {
            isLoading.value = false
        }
    }

    function updateStatus(newStatus: 'draft' | 'confirmed' | 'paid') {
        status.value = newStatus
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
        fetchTrainerData,
        updateStatus,
        doExport
    }
})
