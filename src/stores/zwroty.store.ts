import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type DeptType = 'sprzedaz' | 'sekretariat' | 'dzial_jakosci' | 'admin' | 'super_admin'
export type RefundStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'manual_pending'
export type RefundType = 'resignation' | 'overpayment' | 'other'
export type TransferMethod = 'imoje_api' | 'manual_transfer'

export interface RefundRequest {
  id: number
  student_name: string
  student_id: number
  trainer_name: string
  group_name: string
  program: string
  refund_amount: number
  refund_type: RefundType
  status: RefundStatus
  reason_short: string
  reason_full: string
  initiated_at: string
  initiator_name: string
  initiator_dept: DeptType
  dj_card_id?: number
  dj_attachments?: string[]
  total_paid: number
  months_used: number
  months_total: number
  has_discount: boolean
  full_price_per_month?: number
  notified_before_30: boolean
  notification_date: string
  iban: string
  iban_owner: string
  bank_name: string
  imoje_tx_id?: string
  imoje_refund_tx_id?: string
  transfer_method: TransferMethod
  manual_transfer_iban?: string
  manual_transfer_owner?: string
  manual_transfer_bank?: string
  original_invoice_number: string
  fk_number?: string
  refund_title?: string
  approved_by?: string
  approved_at?: string
  rejected_reason?: string
  email_sent: boolean
  parent_email: string
}

export const PRESET_TITLES = [
  'Zwrot za rezygnację z zajęć — Program Space Memory',
  'Zwrot za rezygnację z zajęć — Program INDIGO',
  'Zwrot nadpłaty — duplikat płatności',
  'Zwrot za niewykorzystane miesiące abonamentu',
  'Zwrot — wskazania medyczne',
  'Zwrot z powodu przeprowadzki',
]

const MOCK: RefundRequest[] = [
  { id:1, student_name:'Zuzanna Kowalczyk', student_id:101, trainer_name:'Ewa Lewandowska', group_name:'Gr. A', program:'Space Memory', refund_amount:1173, refund_type:'resignation', status:'pending', reason_short:'Przeprowadzka rodziny', reason_full:'Przeprowadzka rodziny do innego miasta. Klient powiadomił osobiście w biurze 3 kwietnia. Podpisał oświadczenie o rezygnacji z zajęć.', initiated_at:'2025-04-03T10:22:00Z', initiator_name:'Tomasz W.', initiator_dept:'sprzedaz', total_paid:2640, months_used:3, months_total:6, has_discount:true, full_price_per_month:489, notified_before_30:true, notification_date:'2025-04-03', iban:'PL61 1090 1014 0000 0712 1981 2874', iban_owner:'Anna Kowalczyk', bank_name:'ING Bank Śląski', imoje_tx_id:'TX-2025-0301-8847', transfer_method:'imoje_api', original_invoice_number:'FV/2025/02/0041', fk_number:'FK/2025/04/0003', email_sent:false, parent_email:'anna.kowalczyk@email.pl' },
  { id:2, student_name:'Mikołaj Dąbrowski', student_id:102, trainer_name:'Marek Wójcik', group_name:'Gr. C', program:'INDIGO', refund_amount:489, refund_type:'overpayment', status:'pending', reason_short:'Podwójna płatność przez Imoje', reason_full:'Podwójna płatność przez Imoje — klient kliknął przycisk zapłać dwukrotnie. TX-2025-0401-2219 jest duplikatem TX-2025-0401-2211.', initiated_at:'2025-04-05T14:05:00Z', initiator_name:'Marta S.', initiator_dept:'sekretariat', total_paid:489, months_used:0, months_total:1, has_discount:false, notified_before_30:true, notification_date:'2025-04-05', iban:'PL48 1140 2004 0000 3502 7581 6654', iban_owner:'Piotr Dąbrowski', bank_name:'mBank', imoje_tx_id:'TX-2025-0401-2219', transfer_method:'imoje_api', original_invoice_number:'FV/2025/04/0018', fk_number:'FK/2025/04/0004', email_sent:false, parent_email:'p.dabrowski@email.pl' },
  { id:3, student_name:'Amelia Wróbel', student_id:103, trainer_name:'Anna Kowalska', group_name:'Gr. B', program:'Space Memory', refund_amount:978, refund_type:'resignation', status:'pending', reason_short:'Wskazania medyczne', reason_full:'Wskazania medyczne dziecka — diagnoza przewlekła, zajęcia przeciwwskazane. Potwierdzone zaświadczeniem lekarskim.', initiated_at:'2025-04-07T09:15:00Z', initiator_name:'Maria D.', initiator_dept:'dzial_jakosci', dj_card_id:45, dj_attachments:['Zaświadczenie lekarskie','DJ: Maria D. · 07.04'], total_paid:978, months_used:1, months_total:3, has_discount:false, notified_before_30:true, notification_date:'2025-04-07', iban:'PL27 1020 4476 0000 8112 0081 0001', iban_owner:'Katarzyna Wróbel', bank_name:'PKO Bank Polski', imoje_tx_id:'TX-2025-0302-5521', transfer_method:'imoje_api', original_invoice_number:'FV/2025/02/0055', fk_number:'FK/2025/04/0005', email_sent:false, parent_email:'k.wrobel@email.pl' },
  { id:4, student_name:'Jakub Nowak', student_id:104, trainer_name:'Piotr Zaremba', group_name:'Gr. D', program:'Space Memory', refund_amount:489, refund_type:'resignation', status:'processing', reason_short:'Rezygnacja — zmiana szkoły', reason_full:'Rezygnacja z zajęć po 2 miesiącach. Powód: zmiana szkoły.', initiated_at:'2025-04-08T11:00:00Z', initiator_name:'Ty (Marta B.)', initiator_dept:'sekretariat', total_paid:978, months_used:2, months_total:3, has_discount:false, notified_before_30:true, notification_date:'2025-04-08', iban:'PL33 1050 1025 1000 0097 0701 5566', iban_owner:'Jan Nowak', bank_name:'ING Bank Śląski', imoje_tx_id:'TX-2025-0402-1155', transfer_method:'imoje_api', original_invoice_number:'FV/2025/03/0061', fk_number:'FK/2025/04/0002', refund_title:'Zwrot za rezygnację z zajęć — Program Space Memory', approved_by:'Marta B.', approved_at:'2025-04-08T16:30:00Z', email_sent:false, parent_email:'j.nowak@email.pl' },
  { id:5, student_name:'Oliwia Kamińska', student_id:105, trainer_name:'Ewa Lewandowska', group_name:'Gr. A', program:'Space Memory', refund_amount:734, refund_type:'resignation', status:'completed', reason_short:'Rezygnacja', reason_full:'Rezygnacja z zajęć po przeprowadzce.', initiated_at:'2025-03-25T09:00:00Z', initiator_name:'Marta B.', initiator_dept:'sekretariat', total_paid:978, months_used:1, months_total:3, has_discount:false, notified_before_30:true, notification_date:'2025-03-25', iban:'PL10 1050 1025 1000 0097 0701 1234', iban_owner:'Joanna Kamińska', bank_name:'PKO Bank Polski', imoje_tx_id:'TX-2025-0301-4412', transfer_method:'imoje_api', original_invoice_number:'FV/2025/02/0031', fk_number:'FK/2025/03/0011', approved_by:'Marta B.', approved_at:'2025-03-28T10:00:00Z', email_sent:true, parent_email:'j.kaminska@email.pl' },
  { id:6, student_name:'Szymon Lewicki', student_id:106, trainer_name:'Marek Wójcik', group_name:'Gr. C', program:'INDIGO', refund_amount:245, refund_type:'overpayment', status:'completed', reason_short:'Nadpłata', reason_full:'Duplikat płatności przez błąd w aplikacji.', initiated_at:'2025-03-22T14:00:00Z', initiator_name:'Marta B.', initiator_dept:'sekretariat', total_paid:245, months_used:0, months_total:1, has_discount:false, notified_before_30:true, notification_date:'2025-03-22', iban:'PL22 1090 1014 0000 0712 5566 7788', iban_owner:'Robert Lewicki', bank_name:'ING Bank Śląski', imoje_tx_id:'TX-2025-0302-8899', transfer_method:'imoje_api', original_invoice_number:'FV/2025/03/0042', fk_number:'FK/2025/03/0009', approved_by:'Marta B.', approved_at:'2025-03-25T10:00:00Z', email_sent:true, parent_email:'r.lewicki@email.pl' },
  { id:7, student_name:'Zofia Piotrowska', student_id:107, trainer_name:'Anna Kowalska', group_name:'Gr. B', program:'Space Memory', refund_amount:978, refund_type:'resignation', status:'rejected', reason_short:'Rezygnacja', reason_full:'Rezygnacja po naruszeniu zasady powiadomienia.', initiated_at:'2025-03-20T11:00:00Z', initiator_name:'Tomasz W.', initiator_dept:'sprzedaz', total_paid:1956, months_used:2, months_total:6, has_discount:true, full_price_per_month:489, notified_before_30:false, notification_date:'2025-03-31', iban:'PL55 1020 4476 0000 8112 0044 5566', iban_owner:'Ewa Piotrowska', bank_name:'PKO Bank Polski', imoje_tx_id:'TX-2025-0301-7723', transfer_method:'imoje_api', original_invoice_number:'FV/2025/01/0115', rejected_reason:'Naruszono zasadę powiadomienia przed 30. dniem miesiąca. Powiadomienie wpłynęło 31 marca — po terminie. Wniosek odrzucony zgodnie z regulaminem.', approved_by:'Marta B.', approved_at:'2025-03-22T09:00:00Z', email_sent:false, parent_email:'e.piotrowska@email.pl' },
]

export const useZwrotyStore = defineStore('zwroty', () => {
  const refunds = ref<RefundRequest[]>(MOCK)
  const expandedRow = ref<number | null>(null)
  const activeTab = ref<'pending' | 'processing' | 'history'>('pending')
  const filters = ref({ search: '', month: '', type: '' as RefundType | '' })
  const rowTitles = ref<Record<number, string>>({})
  const rowSelectVal = ref<Record<number, string>>({})
  const rowAltAccount = ref<Record<number, boolean>>({})
  const rowAltIban = ref<Record<number, string>>({})
  const rowAltOwner = ref<Record<number, string>>({})
  const rowAltBank = ref<Record<number, string>>({})

  const stats = computed(() => ({
    pending_count: refunds.value.filter(r => r.status === 'pending').length,
    pending_amount: refunds.value.filter(r => r.status === 'pending').reduce((s, r) => s + r.refund_amount, 0),
    completed_month: refunds.value.filter(r => r.status === 'completed').length,
    rejected_month: refunds.value.filter(r => r.status === 'rejected').length,
  }))

  function match(r: RefundRequest) {
    const q = filters.value.search.toLowerCase()
    if (q && !r.student_name.toLowerCase().includes(q) && !r.trainer_name.toLowerCase().includes(q) && !r.reason_short.toLowerCase().includes(q)) return false
    if (filters.value.type && r.refund_type !== filters.value.type) return false
    return true
  }

  const pendingRefunds = computed(() => refunds.value.filter(r => r.status === 'pending' && match(r)))
  const processingRefunds = computed(() => refunds.value.filter(r => r.status === 'processing'))
  const historyRefunds = computed(() => refunds.value.filter(r => ['completed','rejected'].includes(r.status)))
  const pendingCount = computed(() => pendingRefunds.value.length)

  function toggleRow(id: number) { expandedRow.value = expandedRow.value === id ? null : id }

  function approveRefund(id: number) {
    const r = refunds.value.find(r => r.id === id)
    if (!r) return
    r.refund_title = rowTitles.value[id]
    r.status = rowAltIban.value[id] ? 'manual_pending' : 'processing'
    r.approved_by = 'Marta B.'; r.approved_at = new Date().toISOString()
    if (rowAltIban.value[id]) { r.manual_transfer_iban = rowAltIban.value[id]; r.manual_transfer_owner = rowAltOwner.value[id]; r.manual_transfer_bank = rowAltBank.value[id] }
    expandedRow.value = null
  }

  function rejectRefund(id: number, reason: string) {
    const r = refunds.value.find(r => r.id === id)
    if (!r) return
    r.status = 'rejected'; r.rejected_reason = reason; r.approved_by = 'Marta B.'; r.approved_at = new Date().toISOString()
    expandedRow.value = null
  }

  function markEmailSent(id: number) { const r = refunds.value.find(r => r.id === id); if (r) r.email_sent = true }

  return { refunds, expandedRow, activeTab, filters, rowTitles, rowSelectVal, rowAltAccount, rowAltIban, rowAltOwner, rowAltBank, stats, pendingRefunds, processingRefunds, historyRefunds, pendingCount, toggleRow, approveRefund, rejectRefund, markEmailSent }
})
