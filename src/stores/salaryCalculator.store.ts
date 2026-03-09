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
        trialLessons: 35.00,
        rezygnacje: 0,
        extraBonus: 215.00, // Dojazd + Premie
        penalties: 0,

        // Details for Sections
        activeKids: 58,
        graduationPct: 11,
        rezygnacjeBonusPct: 1, // +1% if rezygnacje == 0
    })

    const selectedTeacher = computed(() => {
        return teachers.value.find(t => t.id === selectedTeacherId.value) || teachers.value[0]
    })

    // Calculations
    const subtotalBeforeBonus = computed(() => {
        const d = salaryData.value
        return d.subscriptions + d.substitutions + d.methodical + d.individual +
            d.olympiad + d.travel + d.adminDuty + d.trialLessons + d.extraBonus
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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 600))
            selectedTeacherId.value = id
            selectedMonth.value = month

            // Update mock data based on teacher
            if (id === 'marek') {
                salaryData.value.subscriptions = 2100.50
                salaryData.value.rezygnacje = 2
                salaryData.value.adminDuty = 500
                salaryData.value.travel = 100
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
                    trialLessons: 35.00,
                    rezygnacje: 0,
                    extraBonus: 215.00,
                    penalties: 0,
                    activeKids: 58,
                    graduationPct: 11,
                    rezygnacjeBonusPct: 1
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

    function exportToExcel() {
        console.log('Exporting to Excel...')
        // Mock notification or real logic if needed
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
        subtotalBeforeBonus,
        rezygnacjeBonusAmount,
        totalPayout,
        fetchTrainerData,
        updateStatus,
        exportToExcel
    }
})
