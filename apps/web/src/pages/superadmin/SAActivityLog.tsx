import { useCallback, useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/layout/SuperAdminLayout';
import Panel from '../../components/ui/Panel';
import superAdminService, { SAActivityItem } from '../../services/superAdminService';
import SortTh from '../../components/ui/SortTh';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (entryDay.getTime() === today.getTime())     return `Today, ${time}`;
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

function categoryToApiParam(key: string): string | undefined {
  return key === 'all' ? undefined : key;
}

const PAGE_SIZE = 25;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SAActivityLog() {
  const [items, setItems]             = useState<SAActivityItem[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState('');
  const [category, setCategory]       = useState('all');
  const [sortBy, setSortBy]           = useState('timestamp');
  const [sortOrder, setSortOrder]     = useState<'asc' | 'desc'>('desc');

  const handleSort = (col: string) => {
    if (col === sortBy) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  const load = useCallback(
    async (cat: string, replace = true) => {
      replace ? setLoading(true) : setLoadingMore(true);
      setError('');
      try {
        const apiCategory = categoryToApiParam(cat);
        const res = await superAdminService.getActivity({
          category: apiCategory,
          limit: PAGE_SIZE,
          offset: replace ? 0 : items.length,
          sortBy,
          sortOrder,
        });
        setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
      } catch {
        setError('Failed to load activity log. Please try again.');
      } finally {
        replace ? setLoading(false) : setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category, items.length, sortBy, sortOrder],
  );

  useEffect(() => {
    setItems([]);
    load(category, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sortBy, sortOrder]);

  const handleCategoryChange = (key: string) => {
    setItems([]);
    setTotal(0);
    setCategory(key);
  };

  const handleLoadMore = () => load(category, false);
  const hasMore = items.length < total;

  return (
    <SuperAdminLayout>
      {error && (
        <div className="mb-4 px-3 py-[9px] bg-urgent-bg border border-urgent rounded-[8px] text-[11.5px] text-urgent font-semibold">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[3px]">Activity Log</h1>
        <p className="text-[11.5px] text-slate">
          Platform-wide chronological record of all actions across all facilities
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
                <SortTh label="Timestamp" column="timestamp" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <SortTh label="Actor" column="actor" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <th style={{ width: 160 }}>Action</th>
                <th>Details</th>
                <th style={{ width: 150 }}>Facility</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center text-[12px] text-slate py-10">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-[12px] text-slate py-10">
                    No activity recorded yet.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id}>
                    <td className="text-[12.5px] text-ink whitespace-nowrap">
                      {formatTimestamp(row.createdAt)}
                    </td>
                    <td className="text-[12.5px] text-ink">
                      {row.actorName} ({roleLabel(row.actorRole)})
                    </td>
                    <td className="text-[12.5px] text-ink">
                      {ACTION_LABELS[row.action] ?? row.action}
                    </td>
                    <td className="text-[12.5px] text-ink max-w-[300px]">
                      {row.description}
                    </td>
                    <td className="text-[12px] text-slate">
                      {row.facilityName ?? 'Platform'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load more */}
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
    </SuperAdminLayout>
  );
}
