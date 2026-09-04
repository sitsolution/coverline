import api from './api';

export interface DocumentReviewRow {
  id: number;
  staffId: number;
  staffName: string;
  staffInitials: string;
  staffRole: string;
  docType: string;
  docTypeLabel: string;
  documentNumber?: string;
  originalFilename: string;
  contentType: string;
  fileUrl: string;
  uploadedAt: string;
  issueDate?: string;
  expiryDate?: string;
  daysUntilExpiry?: number;
  status: string;
  rejectionReason?: string;
  verifiedAt?: string;
}

export interface DocumentReviewListResponse {
  items: DocumentReviewRow[];
  total: number;
  counts: Record<string, number>;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const adminDocumentsService = {
  listDocuments: async (tab = 'pending', search?: string, limit = 25, offset = 0): Promise<DocumentReviewListResponse> => {
    const { data } = await api.get('/admin/documents', {
      params: { tab, search, limit, offset },
    });
    return data;
  },

  getDocument: async (id: number): Promise<DocumentReviewRow> => {
    const { data } = await api.get(`/admin/documents/${id}`);
    return data;
  },

  getFileUrl: (id: number): string => `/api/v1/admin/documents/${id}/file`,

  verifyDocument: async (id: number): Promise<DocumentReviewRow> => {
    const { data } = await api.post(`/admin/documents/${id}/verify`);
    return data;
  },

  rejectDocument: async (id: number, reason: string): Promise<DocumentReviewRow> => {
    const { data } = await api.post(`/admin/documents/${id}/reject`, { reason });
    return data;
  },
};

export default adminDocumentsService;
