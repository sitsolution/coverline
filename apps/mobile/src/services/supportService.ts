import api from './api';

export interface FaqOut {
  id: number;
  question: string;
  answer: string;
  category: string | null;
}

export interface FaqListResponse {
  items: FaqOut[];
  total: number;
}

export interface SupportTicketOut {
  id: number;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

const supportService = {
  listFaqs: async (search?: string): Promise<FaqListResponse> => {
    const { data } = await api.get('/support/faqs', { params: search ? { search } : {} });
    return data;
  },

  createTicket: async (subject: string, message: string): Promise<SupportTicketOut> => {
    const { data } = await api.post('/support/tickets', { subject, message });
    return data;
  },

  listTickets: async (): Promise<SupportTicketOut[]> => {
    const { data } = await api.get('/support/tickets');
    return data;
  },
};

export default supportService;
