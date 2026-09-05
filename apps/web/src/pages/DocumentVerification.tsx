import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import Panel from '../components/ui/Panel';
import TabNav from '../components/ui/TabNav';
import adminDocumentsService, { DocumentReviewRow } from '../services/adminDocumentsService';
import { apiError } from '../utils/apiError';

const TABS = ['all', 'pending', 'verified', 'expired', 'rejected'];
const TAB_LABELS: Record<string, string> = {
  all: 'All', pending: 'Pending Verification', verified: 'Verified',
  expired: 'Expired', rejected: 'Rejected',
};

type BadgeVariant = 'success' | 'warning' | 'urgent' | 'neutral';

function statusVariant(status: string): BadgeVariant {
  if (status === 'verified') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'rejected' || status === 'expired') return 'urgent';
  return 'neutral';
}

function dateLabel(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DocumentVerification() {
  const [activeTab, setActiveTab] = useState('pending');
  const [docs, setDocs] = useState<DocumentReviewRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<DocumentReviewRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const load = useCallback(async (tab: string) => {
    setLoading(true);
    try {
      const res = await adminDocumentsService.listDocuments(tab);
      setDocs(res.items);
      setCounts(res.counts);
      setTotal(res.total);
      setSelected(null);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeTab); }, [load, activeTab]);

  const handleVerify = async () => {
    if (!selected || actionLoading) return;
    setActionLoading(true);
    setActionError('');
    try {
      const updated = await adminDocumentsService.verifyDocument(selected.id);
      setDocs(prev => prev.map(d => d.id === updated.id ? updated : d));
      setSelected(updated);
    } catch (err) {
      setActionError(apiError(err, 'Failed to verify document. Please try again.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected || !rejectReason.trim() || actionLoading) return;
    setActionLoading(true);
    setActionError('');
    try {
      const updated = await adminDocumentsService.rejectDocument(selected.id, rejectReason.trim());
      setDocs(prev => prev.map(d => d.id === updated.id ? updated : d));
      setSelected(updated);
      setShowReject(false);
      setRejectReason('');
    } catch (err) {
      setActionError(apiError(err, 'Failed to reject document. Please try again.'));
    } finally {
      setActionLoading(false);
    }
  };

  const tabLabels = TABS.map(t => counts[t] != null ? `${TAB_LABELS[t]} (${counts[t]})` : TAB_LABELS[t]);

  return (
    <Layout>
      {/* Header */}
      <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Document Verification</h1>
      <p className="text-[11.5px] text-slate mb-4">
        {loading ? '…' : `${counts['pending'] ?? 0} documents awaiting review`}
      </p>

      <TabNav
        tabs={tabLabels}
        active={tabLabels[TABS.indexOf(activeTab)]}
        onChange={(label) => {
          const idx = tabLabels.indexOf(label);
          if (idx >= 0) setActiveTab(TABS[idx]);
        }}
      />

      {/* Two-column layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Left — Document list */}
        <Panel className="p-0 overflow-hidden">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Document Type</th>
                <th>Upload Date</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center text-[12px] text-slate py-8">Loading…</td></tr>
              ) : docs.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-[12px] text-slate py-8">No documents in this tab.</td></tr>
              ) : docs.map((doc) => (
                <tr
                  key={doc.id}
                  className={`cursor-pointer ${selected?.id === doc.id ? 'bg-sky' : ''}`}
                  onClick={() => { setSelected(doc); setShowReject(false); }}
                >
                  <td className="font-semibold">{doc.staffName}</td>
                  <td>{doc.docTypeLabel}</td>
                  <td>{dateLabel(doc.uploadedAt)}</td>
                  <td>{dateLabel(doc.expiryDate)}</td>
                  <td><Badge label={doc.status.charAt(0).toUpperCase() + doc.status.slice(1)} variant={statusVariant(doc.status)} /></td>
                  <td className="text-[12px]">
                    <span
                      className="text-navy-2 font-semibold cursor-pointer hover:underline"
                      onClick={(e) => { e.stopPropagation(); setSelected(doc); setShowReject(false); }}
                    >Review</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        {/* Right — Document Preview */}
        <Panel title="Document Preview">
          {!selected ? (
            <p className="text-center text-slate text-[11.5px] py-8">Select a document to review</p>
          ) : (
            <>
              {/* Inline preview for images/PDFs */}
              <div className="h-[200px] bg-sky rounded-[10px] flex items-center justify-center text-[28px] text-navy-2 mb-3 overflow-hidden">
                {selected.contentType.startsWith('image/') ? (
                  <img
                    src={adminDocumentsService.getFileUrl(selected.id)}
                    alt={selected.originalFilename}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <a
                    href={adminDocumentsService.getFileUrl(selected.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11.5px] font-bold text-navy-2 underline"
                  >
                    📄 View PDF
                  </a>
                )}
              </div>
              <p className="text-[11.5px] text-slate mb-1">{selected.originalFilename}</p>
              <p className="text-[11.5px] text-slate mb-3">{selected.docTypeLabel} · {selected.staffName}</p>
              {selected.documentNumber && (
                <p className="text-[11px] text-slate mb-3">Doc #: {selected.documentNumber}</p>
              )}
              {selected.rejectionReason && (
                <div className="mb-3 px-3 py-[9px] bg-urgent-bg border border-urgent rounded-[8px] text-[11.5px] text-urgent">
                  Rejected: {selected.rejectionReason}
                </div>
              )}

              {actionError && (
                <p className="text-[11px] text-urgent font-semibold mb-2">{actionError}</p>
              )}
              {showReject ? (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Rejection reason…"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-[9px] border-[1.4px] border-line rounded-[9px] text-[12.5px] text-ink outline-none focus:border-urgent mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowReject(false)}
                      className="flex-1 bg-sky text-navy text-[12px] font-bold px-3 py-[9px] rounded-[9px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading || !rejectReason.trim()}
                      className="flex-1 bg-urgent-bg text-urgent text-[12px] font-bold px-3 py-[9px] rounded-[9px] disabled:opacity-60"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              ) : selected.status === 'pending' ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleVerify}
                    disabled={actionLoading}
                    className="flex-1 bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] disabled:opacity-60"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => setShowReject(true)}
                    disabled={actionLoading}
                    className="flex-1 bg-urgent-bg text-urgent text-[13px] font-bold px-4 py-[11px] rounded-[10px] disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <Badge label={selected.status.charAt(0).toUpperCase() + selected.status.slice(1)} variant={statusVariant(selected.status)} />
              )}
            </>
          )}
        </Panel>
      </div>
    </Layout>
  );
}
