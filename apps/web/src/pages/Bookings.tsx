import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import Panel from '../components/ui/Panel';
import TabNav from '../components/ui/TabNav';
import adminBookingsService, { BookingRow } from '../services/adminBookingsService';

const TABS = ['all', 'pending', 'confirmed', 'upcoming', 'completed', 'cancelled'];
const TAB_LABELS: Record<string, string> = {
  all: 'All', pending: 'Pending', confirmed: 'Confirmed',
  upcoming: 'Upcoming', completed: 'Completed', cancelled: 'Cancelled',
};

type BadgeVariant = 'success' | 'warning' | 'urgent' | 'info' | 'neutral';

function statusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'confirmed': return 'success';
    case 'upcoming': return 'info';
    case 'pending': return 'warning';
    case 'completed': return 'neutral';
    case 'cancelled': return 'urgent';
    default: return 'neutral';
  }
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function Bookings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (tab: string) => {
    setLoading(true);
    try {
      const res = await adminBookingsService.listBookings(tab);
      setBookings(res.items);
      setCounts(res.counts);
      setTotal(res.total);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeTab); }, [load, activeTab]);

  const tabLabels = TABS.map(t => counts[t] != null ? `${TAB_LABELS[t]} (${counts[t]})` : TAB_LABELS[t]);

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Shift Bookings</h1>
          <p className="text-[11.5px] text-slate mb-4">{loading ? '…' : `${total} bookings`}</p>
        </div>
        <button
          onClick={() => adminBookingsService.exportCsv(activeTab)}
          className="border-[1.5px] border-navy text-navy text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] bg-transparent"
        >
          ⬇ Export to CSV
        </button>
      </div>

      <TabNav
        tabs={tabLabels}
        active={tabLabels[TABS.indexOf(activeTab)]}
        onChange={(label) => {
          const idx = tabLabels.indexOf(label);
          if (idx >= 0) setActiveTab(TABS[idx]);
        }}
      />

      <Panel>
        <div className="overflow-hidden rounded-[10px] border border-line">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Shift</th>
                <th>Staff</th>
                <th>Booked On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center text-[12px] text-slate py-8">Loading…</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-[12px] text-slate py-8">No bookings found.</td></tr>
              ) : bookings.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold">{r.reference}</td>
                  <td>{r.shiftLabel}</td>
                  <td>{r.staffName}</td>
                  <td>{dateLabel(r.bookedOn)}</td>
                  <td><Badge label={r.displayStatus} variant={statusVariant(r.status)} /></td>
                  <td className="text-[12px]">
                    <span
                      className="text-navy-2 font-semibold cursor-pointer hover:underline"
                      onClick={() => navigate(`/bookings/${r.id}`)}
                    >View</span>
                    {['confirmed', 'upcoming', 'pending'].includes(r.status) && r.staffEmail && (
                      <>
                        {' · '}
                        <a href={`mailto:${r.staffEmail}`} className="text-navy-2 font-semibold hover:underline">Contact</a>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </Layout>
  );
}
