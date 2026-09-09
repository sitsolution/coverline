import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import KpiCard from '../components/ui/KpiCard';
import Panel from '../components/ui/Panel';
import Badge from '../components/ui/Badge';
import adminDashboardService, { AdminDashboardResponse } from '../services/adminDashboardService';

function shiftTimeLabel(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function deltaToneColor(tone: string): string {
  if (tone === 'positive') return '#1F8A5F';
  if (tone === 'negative') return '#C0392B';
  if (tone === 'warning') return '#C97A2B';
  return '#5C6B7A';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminDashboardService.getDashboard().then(setData).catch(() => setError('Failed to load dashboard.')).finally(() => setLoading(false));
  }, []);

  // Bar chart: scale bars relative to max value
  const bars = data?.shiftVolumeByWeek ?? [];
  const maxBar = bars.length ? Math.max(...bars.map(b => b.value), 1) : 1;

  return (
    <Layout>
      {error && (
        <div className="mb-4 px-3 py-[9px] bg-urgent-bg border border-urgent rounded-[8px] text-[11.5px] text-urgent font-semibold">
          {error}
        </div>
      )}
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Dashboard</h1>
          <p className="text-[11.5px] text-slate">
            {data?.facilityName ?? '—'} · {data?.periodLabel ?? ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/shifts/new')}
          className="bg-navy text-white text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] hover:bg-navy-2 transition-colors"
        >
          + Create New Shift
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-3 mb-[18px]">
        {loading
          ? Array(4).fill(null).map((_, i) => <KpiCard key={i} label="…" value="—" delta="" />)
          : (data?.kpis ?? []).map(k => (
              <KpiCard
                key={k.label}
                label={k.label}
                value={k.value}
                delta={k.delta}
                deltaColor={deltaToneColor(k.deltaTone)}
              />
            ))
        }
      </div>

      {/* Two column: chart + quick actions */}
      <div className="grid gap-4 mb-0" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Bar chart */}
        <Panel title="Shift Volume by Week">
          <div className="flex items-end gap-[10px] h-[130px]">
            {loading
              ? Array(7).fill(null).map((_, i) => (
                  <div key={i} className="flex-1 bg-sky-2 rounded-t-[5px]" style={{ height: '40%' }} />
                ))
              : bars.map((b, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-sky-2 rounded-t-[5px]"
                    style={{ height: `${Math.max(6, (b.value / maxBar) * 100)}%` }}
                    title={`${b.label}: ${b.value}`}
                  />
                ))
            }
          </div>
        </Panel>

        {/* Quick actions */}
        <Panel title="Quick Actions">
          <button onClick={() => navigate('/shifts/new')} className="w-full bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] mb-2 hover:bg-sky-2 transition-colors text-left">
            + Create New Shift
          </button>
          <button onClick={() => navigate('/staff')} className="w-full bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] mb-2 hover:bg-sky-2 transition-colors text-left">
            + Add New Staff
          </button>
          <button onClick={() => navigate('/reports')} className="w-full bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] hover:bg-sky-2 transition-colors text-left">
            📄 Generate Report
          </button>
        </Panel>
      </div>

      {/* Urgent shifts table */}
      <Panel
        title="Urgent Shifts"
        action={<span className="text-[11px] font-bold text-navy-2 cursor-pointer hover:underline" onClick={() => navigate('/shifts')}>View all</span>}
      >
        <div className="overflow-hidden rounded-[10px] border border-line">
          <table className="adm-table">
            <thead>
              <tr>
                {['Shift', 'Location', 'Date', 'Specialty', 'Status'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center text-[12px] text-slate py-6">Loading…</td></tr>
              ) : (data?.urgentShifts ?? []).length === 0 ? (
                <tr><td colSpan={5} className="text-center text-[12px] text-slate py-6">No urgent shifts.</td></tr>
              ) : (data?.urgentShifts ?? []).map((row) => (
                <tr key={row.id} className="cursor-pointer" onClick={() => navigate(`/shifts/${row.id}`)}>
                  <td className="font-semibold">{row.title}</td>
                  <td>{row.location}</td>
                  <td>{shiftTimeLabel(row.startTime)}</td>
                  <td>{row.specialty}</td>
                  <td><Badge label={row.status === 'unfilled' ? 'Unfilled' : 'Pending'} variant={row.status === 'unfilled' ? 'urgent' : 'warning'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </Layout>
  );
}
