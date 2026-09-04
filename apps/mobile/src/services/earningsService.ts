import api from './api';

export interface EarningsSummary {
  totalEarnings: number;
  thisMonth: number;
  pending: number;
  availableToWithdraw: number;
  nextPayoutDate: string;
}

export interface TrendPoint {
  label: string;
  periodStart: string;
  amount: number;
}

export interface TransactionOut {
  id: number;
  facilityName: string | null;
  facilityInitials: string | null;
  specialty: string | null;
  amount: number;
  status: string;
  earnedAt: string;
  paidAt: string | null;
  reference: string | null;
}

export interface TransactionListResponse {
  items: TransactionOut[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PayoutRequestOut {
  id: number;
  amount: number;
  status: string;
  requestedAt: string;
  processedAt: string | null;
}

const earningsService = {
  getSummary: async (): Promise<EarningsSummary> => {
    const { data } = await api.get('/earnings/summary');
    return data;
  },

  getTrend: async (months = 7): Promise<TrendPoint[]> => {
    const { data } = await api.get('/earnings/trend', { params: { months } });
    return data;
  },

  getTransactions: async (limit = 20, offset = 0): Promise<TransactionListResponse> => {
    const { data } = await api.get('/earnings/transactions', { params: { limit, offset } });
    return data;
  },

  requestPayout: async (amount?: number): Promise<PayoutRequestOut> => {
    const { data } = await api.post('/earnings/payouts', amount != null ? { amount } : {});
    return data;
  },

  getPayouts: async (): Promise<PayoutRequestOut[]> => {
    const { data } = await api.get('/earnings/payouts');
    return data;
  },
};

export default earningsService;
