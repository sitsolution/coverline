import api from './api';
import type { KpiCard } from './adminDashboardService';

export interface InvoiceRow {
  id: number;
  number: string;
  issuedOn: string;
  dueOn: string;
  total: number;
  status: string;
  paidAt?: string;
}

export interface InvoiceLineOut {
  id: number;
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
  shiftId?: number;
}

export interface InvoiceDetail extends InvoiceRow {
  facilityName: string;
  periodStart: string;
  periodEnd: string;
  subtotal: number;
  tax: number;
  notes?: string;
  lineItems: InvoiceLineOut[];
}

export interface PaymentMethodOut {
  id: number;
  label: string;
  last4: string;
  methodType: string;
  isPrimary: boolean;
}

export interface InvoiceListResponse {
  items: InvoiceRow[];
  total: number;
  counts: Record<string, number>;
  kpis: KpiCard[];
  paymentMethod?: PaymentMethodOut;
}

const adminBillingService = {
  listInvoices: async (tab = 'all', limit = 25, offset = 0): Promise<InvoiceListResponse> => {
    const { data } = await api.get('/admin/billing', { params: { tab, limit, offset } });
    return data;
  },

  getInvoice: async (id: number): Promise<InvoiceDetail> => {
    const { data } = await api.get(`/admin/billing/${id}`);
    return data;
  },

  payInvoice: async (id: number, paymentMethodId?: number, reference?: string): Promise<InvoiceDetail> => {
    const { data } = await api.post(`/admin/billing/${id}/pay`, { paymentMethodId, reference });
    return data;
  },

  downloadInvoice: async (id: number) => {
    const { data } = await api.get(`/admin/billing/${id}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export default adminBillingService;
