import http from './http';
import { ENDPOINTS } from './endpoints';

export interface Invoice {
  id: number;
  student_id: number;
  project_id: number;
  number: string;
  document_type: string;
  issue_date: string;
  sale_date: string;
  due_date: string;
  payment_date?: string;
  amount_net: number;
  vat_value: number;
  amount_gross: number;
  vat_rate: string;
  currency: string;
  buyer_name: string;
  buyer_tax_id?: string;
  buyer_address: string;
  payment_method?: string;
  notes?: string;
  ksef_status: 'draft' | 'wystawiona' | 'wyslana' | 'oplacona' | 'anulowana';
  ksef_reference?: string;
  pdf_path?: string;
  student?: {
    id: number;
    surname: string;
    lastname: string;
    email: string;
  };
  project?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface InvoicesResponse {
  data: Invoice[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface InvoiceFilters {
  project_id?: number;
  type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export const invoicesApi = {
  /**
   * Fetch paginated invoices with filters
   */
  getList(filters: InvoiceFilters = {}): Promise<InvoicesResponse> {
    return http.get(ENDPOINTS.INVOICES.BASE, { params: filters });
  },

  /**
   * Fetch single invoice detail
   */
  getById(id: number | string): Promise<Invoice> {
    return http.get(ENDPOINTS.INVOICES.BY_ID(id));
  },

  /**
   * Manually create an invoice
   */
  create(data: Partial<Invoice> & { project_code: string }): Promise<Invoice> {
    return http.post(ENDPOINTS.INVOICES.BASE, data);
  },

  /**
   * Update invoice or its status
   */
  update(id: number | string, data: Partial<Invoice>): Promise<Invoice> {
    return http.patch(ENDPOINTS.INVOICES.BY_ID(id), data);
  },

  /**
   * Delete/Cancel an invoice
   */
  delete(id: number | string): Promise<void> {
    return http.delete(ENDPOINTS.INVOICES.BY_ID(id));
  },

  /**
   * Helper to get PDF download URL
   */
  getPdfUrl(id: number | string): string {
    // Usually routes in Laravel are /api/v1/payments/documents/{id}/pdf 
    // but for our new module we might have a dedicated one.
    // For now we use the existing one if possible or define a new one.
    return `/api/v1/payments/documents/${id}/pdf`;
  }
};
