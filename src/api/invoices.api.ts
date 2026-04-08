import { http } from './http';
import { endpoints } from './endpoints';

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
    const params = { ...filters };
    if (params.search) {
      delete params.search;
      (params as any).q = filters.search;
    }
    return http.get(endpoints.INVOICES.BASE, { params });
  },

  /**
   * Fetch single invoice detail
   */
  getById(id: number | string): Promise<Invoice> {
    return http.get(endpoints.INVOICES.BY_ID(id));
  },

  /**
   * Manually create an invoice
   */
  create(data: Partial<Invoice> & { project_code: string }): Promise<Invoice> {
    return http.post(endpoints.INVOICES.BASE, data);
  },

  /**
   * Update invoice or its status
   */
  update(id: number | string, data: Partial<Invoice>): Promise<Invoice> {
    return http.patch(endpoints.INVOICES.BY_ID(id), data);
  },

  /**
   * Delete/Cancel an invoice
   */
  delete(id: number | string): Promise<void> {
    return http.delete(endpoints.INVOICES.BY_ID(id));
  },

  /**
   * Helper to get PDF download URL
   */
  getPdfUrl(id: number | string): string {
    return `/api/v1/payments/documents/${id}/pdf`;
  },

  /**
   * Helper to get XLSX export URL with filters
   */
  getExportUrl(filters: InvoiceFilters = {}): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const apiKey = key === 'search' ? 'q' : key;
        params.append(apiKey, value.toString());
      }
    });
    // In sm-recrut, it's /v1/invoices/export
    return `/v1/${endpoints.INVOICES.BASE}/export?${params.toString()}`;
  }
};
