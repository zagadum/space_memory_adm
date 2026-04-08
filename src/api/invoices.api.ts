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
  ksef_status: 'draft' | 'sending' | 'pending' | 'sent' | 'error' | 'cancelled';
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
   * Create a correction (FK) for an existing invoice
   */
  correct(id: number | string, data: { amount_gross: number; reason: string; notes?: string; issue_date?: string }): Promise<Invoice> {
    return http.post(`${endpoints.INVOICES.BY_ID(id)}/correct`, data);
  },

  /**
   * Convert Pro Forma (PF) to Invoice (FA)
   */
  convert(id: number | string): Promise<Invoice> {
    return http.post(`${endpoints.INVOICES.BY_ID(id)}/convert`);
  },

  /**
   * Send/Resend invoice email to student
   */
  sendEmail(id: number | string, data?: { subject?: string; body?: string }): Promise<void> {
    return http.post(`${endpoints.INVOICES.BY_ID(id)}/email`, data);
  },

  /**
   * Look up company data by NIP (GUS)
   */
  lookupNip(nip: string): Promise<any> {
    return http.get(`${endpoints.INVOICES.BASE}/lookup-nip/${nip}`);
  },

  /**
   * Send invoice to KSeF
   */
  async sendToKsef(id: number): Promise<any> {
    const response = await http.post(`${endpoints.INVOICES.BY_ID(id)}/ksef-send`);
    return response.data;
  },

  /**
   * Get KSeF status
   */
  async getKsefStatus(id: number): Promise<{ status: string; reference?: string; updated_at: string }> {
    const { data } = await http.get(`${endpoints.INVOICES.BY_ID(id)}/ksef-status`);
    return data;
  },

  async getStats(params: InvoiceFilters = {}): Promise<any> {
    const { data } = await http.get(`/v1/invoices/stats`, { params });
    return data;
  },

  async createCorrection(id: number, data: { reason: string; amount_gross: number }): Promise<Invoice> {
    const { data: res } = await http.post(`${endpoints.INVOICES.BY_ID(id)}/correct`, data);
    return res;
  },

  async sendBulkToKsef(ids: number[]): Promise<{ message: string }> {
    const { data } = await http.post('/v1/invoices/bulk-ksef', { ids });
    return data;
  },

  async bulkDownloadPDFs(ids: number[]): Promise<void> {
    const response = await http.post('/v1/invoices/bulk-download', { ids }, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoices_bulk_${new Date().getTime()}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },


  async getAuditLogs(id: number): Promise<any[]> {
    const { data } = await http.get(`/v1/invoices/${id}/logs`);
    return data;
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
    return `/v1/invoices/export?${params.toString()}`;
  },

  async exportExcel(filters: InvoiceFilters & { ids?: number[] }): Promise<void> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'ids' && Array.isArray(value)) {
          value.forEach(id => params.append('ids[]', id.toString()));
        } else {
          const apiKey = key === 'search' ? 'q' : key;
          params.append(apiKey, value.toString());
        }
      }
    });

    const response = await http.get(`/v1/invoices/export?${params.toString()}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoices_export_${new Date().getTime()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
