import api from './api';

export interface DocumentOut {
  id: number;
  docType: string;
  label: string | null;
  displayName: string;
  documentNumber: string | null;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  fileUrl: string;
  issueDate: string | null;
  expiryDate: string | null;
  status: string;
  rejectionReason: string | null;
  isExpiringSoon: boolean;
  daysUntilExpiry: number | null;
  createdAt: string;
}

export interface DocumentGroup {
  docType: string;
  title: string;
  statusLabel: string;
  statusVariant: string;
  documents: DocumentOut[];
}

export interface DocumentListResponse {
  groups: DocumentGroup[];
  total: number;
  verifiedCount: number;
  pendingCount: number;
  expiredCount: number;
}

export interface DocumentTypeOption {
  value: string;
  label: string;
  requiresNumber: boolean;
  requiresExpiry: boolean;
}

const documentService = {
  listDocuments: async (): Promise<DocumentListResponse> => {
    const { data } = await api.get('/documents');
    return data;
  },

  getDocumentTypes: async (): Promise<DocumentTypeOption[]> => {
    const { data } = await api.get('/documents/types');
    return data;
  },

  uploadDocument: async (payload: {
    file: { uri: string; name: string; type: string };
    docType: string;
    documentNumber?: string;
    label?: string;
    issueDate?: string;
    expiryDate?: string;
  }): Promise<DocumentOut> => {
    const form = new FormData();
    form.append('file', payload.file as unknown as Blob);
    form.append('docType', payload.docType);
    form.append('confirmed', 'true');
    if (payload.documentNumber) form.append('documentNumber', payload.documentNumber);
    if (payload.label) form.append('label', payload.label);
    if (payload.issueDate) form.append('issueDate', payload.issueDate);
    if (payload.expiryDate) form.append('expiryDate', payload.expiryDate);

    const { data } = await api.post('/documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteDocument: async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};

export default documentService;
