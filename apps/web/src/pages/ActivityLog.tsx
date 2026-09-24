import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import Panel from '../components/ui/Panel';
import adminActivityService, { ActivityLogRow } from '../services/adminActivityService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (entryDay.getTime() === today.getTime()) return `Today, ${time}`;
  if (entryDay.getTime() === yesterday.getTime()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, ${time}`;
}

function roleLabel(role: string): string {
  switch (role) {
    case 'doctor':         return 'Doctor';
    case 'nurse':          return 'Nurse';
    case 'ot_tech':        return 'OT Tech';
    case 'housekeeping':   return 'Housekeeping';
    case 'facility_admin': return 'Admin';
    case 'super_admin':    return 'Super Admin';
    default:               return role;
  }
}

const ACTION_LABELS: Record<string, string> = {
  shift_applied:          'Applied to shift',
  application_cancelled:  'Cancelled application',
  availability_updated:   'Updated availability',
  document_uploaded:      'Uploaded document',
  document_verified:      'Verified document',
  document_rejected:      'Rejected document',
  shift_created:          'Created shift',
  shift_updated:          'Updated shift',
  shift_cancelled:        'Cancelled shift',
  booking_confirmed:      'Confirmed booking',
  booking_completed:      'Completed booking',
  booking_cancelled:      'Cancelled booking',
  user_added:             'Added user',
  user_deactivated:       'Deactivated user',
};

// ─── Filter chips ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'all',       label: 'All Activity' },
  { key: 'shifts',    label: 'Shifts'       },
  { key: 'bookings',  label: 'Bookings'     },
  { key: 'documents', label: 'Documents'    },
  { key: 'users',     label: 'Users'        },
];

const PAGE_SIZE = 25;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ActivityLog() {
  const [items, setItems]         = useState<ActivityLogRow[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]         = useState('');
  const [category, setCategory]   = useState('all');

  const load = useCallback(async (cat: string, replace = true) => {
    replace ? setLoading(true) : setLoadingMore(true);
    setError('');
    try {
      const res = await adminActivityService.listActivity({
        category: cat !== 'all' ? cat : undefined,
        limit: PAGE_SIZE,
        offset: replace ? 0 : items.length,
      });
      setItems(prev => replace ? res.items : [...prev, ...res.items]);
      setTotal(res.total);
    } catch {
      setError('Failed to load activity log. Please try again.');
    } finally {
      replace ? setLoading(false) : setLoadingMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, items.length]);

  useEffect(() => {
    load(category, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleCategoryChange = (key: string) => {
    if (key === category) return;
    setItems([]);
    setTotal(0);
    setCategory(key);
  };

  const handleLoadMore = () => load(category, false);

  const hasMore = items.length < total;

  return (
    <Layout>
      {error && (
        <div className="mb-4 px-3 py-[9px] bg-urgent-bg border border-urgent rounded-[8px] text-[11.5px] text-urgent font-semibold">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[3px]">Activity Log</h1>
        <p className="text-[11.5px] text-slate">
          Chronological record of all actions at this facility
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {CATEGORIES.map(({ key, label }) => {
          const active = category === key;
          return (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              className={
                active
                  ? 'bg-navy text-white border border-navy rounded-[20px] px-[13px] py-[6px] text-[11px] font-semibold cursor-pointer select-none transition-colors outline-none'
                  : 'bg-white text-slate border border-line rounded-[20px] px-[13px] py-[6px] text-[11px] font-semibold cursor-pointer select-none hover:border-navy-2 transition-colors outline-none'
              }
            >
              {label}
            </button>
          );
        })}
        <span className="ml-auto text-[11px] text-slate">
          {loading ? '…' : `${total.toLocaleString()} entries`}
        </span>
      </div>

      {/* Table */}
      <Panel>
        <div className="overflow-hidden rounded-[10px] border border-line">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 170 }}>Timestamp</th>
                <th style={{ width: 200 }}>Actor</th>
                <th style={{ width: 170 }}>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center text-[12px] text-slate py-10">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-[12px] text-slate py-10">
                    No activity recorded yet.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id}>
                    {/* Timestamp — "Today, 9:05 AM" */}
                    <td className="text-[12.5px] text-ink whitespace-nowrap">
                      {formatTimestamp(row.createdAt)}
                    </td>

                    {/* Actor — "Priya Menon (Admin)" */}
                    <td className="text-[12.5px] text-ink">
                      {row.actorName} ({roleLabel(row.actorRole)})
                    </td>

                    {/* Action — plain text */}
                    <td className="text-[12.5px] text-ink">
                      {ACTION_LABELS[row.action] ?? row.action}
                    </td>

                    {/* Details */}
                    <td className="text-[12.5px] text-ink max-w-[360px]">
                      {row.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load earlier activity */}
        {!loading && hasMore && (
          <div className="text-center mt-4">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="text-[11.5px] font-semibold text-navy-2 hover:underline disabled:opacity-50 disabled:cursor-default bg-transparent outline-none cursor-pointer"
            >
              {loadingMore ? 'Loading…' : 'Load earlier activity'}
            </button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <p className="text-[11px] text-slate text-center mt-3">
            Showing {items.length} of {total.toLocaleString()} entries
          </p>
        )}
      </Panel>
    </Layout>
  );
}
