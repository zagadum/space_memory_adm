import http from './http'
import { ENDPOINTS } from './endpoints'

export interface RefundRequest {
  id: number
  student_id: number
  project_id: number
  invoice_id?: number
  amount: number
  currency: string
  type: string
  status: string
  reason?: string
  iban?: string
  iban_owner?: string
  bank_name?: string
  initiator_name?: string
  approver_name?: string
  approved_at?: string
  processed_at?: string
  created_at: string
  student?: {
    first_name: string
    last_name: string
    full_name: string
  }
}

export interface RefundsStats {
  pending_count: number
  pending_amount: number
  processing_count: number
  completed_month: number
  rejected_month: number
}

export interface RefundsResponse {
  data: RefundRequest[]
  total: number
  current_page: number
  last_page: number
}

export const refundsApi = {
  getRefunds(params: any = {}) {
    return http.get<RefundsResponse>('/v1/finance/refunds', { params })
  },

  getStats(params: any = {}) {
    return http.get<RefundsStats>('/v1/finance/refunds/stats', { params })
  },

  approve(id: number, data: { refund_title?: string; manual?: boolean } = {}) {
    return http.post(`/v1/finance/refunds/${id}/approve`, data)
  },

  reject(id: number, reason: string) {
    return http.post(`/v1/finance/refunds/${id}/reject`, { reason })
  }
}
