import Layout from '../components/layout/Layout';
import KpiCard from '../components/ui/KpiCard';
import Panel from '../components/ui/Panel';
import Badge from '../components/ui/Badge';

// ── Data ──────────────────────────────────────────────────────────────────────

const KPIS = [
  { label: 'Total Shifts This Month', value: '86',  delta: '+12% vs last month',  deltaColor: '#1F8A5F' },
  { label: 'Filled Shifts',           value: '71',  delta: '82.5% fill rate',      deltaColor: '#1F8A5F' },
  { label: 'Unfilled Shifts',         value: '15',  delta: '5 urgent',             deltaColor: '#C0392B' },
  { label: 'Active Locum Staff',      value: '132', delta: '+8 this month',        deltaColor: '#1F8A5F' },
];

const BAR_HEIGHTS = [60, 80, 45, 90, 70, 95, 55];

const URGENT_SHIFTS = [
  { shift: 'ER Night Cover',   location: 'Kothrud, Pune',    date: 'Today, 8 PM',     specialty: 'Emergency Med.', status: 'Unfilled', variant: 'urgent'  as const },
  { shift: 'Weekend OPD',      location: 'Kalyani Nagar',    date: 'Sat, 9 AM',       specialty: 'General Med.',   status: 'Unfilled', variant: 'urgent'  as const },
  { shift: 'ICU Relief',       location: 'Wakad, Pune',      date: 'Tomorrow, 8 AM',  specialty: 'Anaesthesia',    status: 'Pending',  variant: 'warning' as const },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <Layout>
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Dashboard</h1>
          <p className="text-[11.5px] text-slate">St. Joseph Hospital · Overview for September 2026</p>
        </div>
        <button className="bg-navy text-white text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] hover:bg-navy-2 transition-colors">
          + Create New Shift
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-3 mb-[18px]">
        {KPIS.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* Two column: chart + quick actions */}
      <div className="grid gap-4 mb-0" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Bar chart */}
        <Panel title="Shift Volume by Week">
          <div className="flex items-end gap-[10px] h-[130px]">
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-sky-2 rounded-t-[5px]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </Panel>

        {/* Quick actions */}
        <Panel title="Quick Actions">
          <button className="w-full bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] mb-2 hover:bg-sky-2 transition-colors text-left">
            + Create New Shift
          </button>
          <button className="w-full bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] mb-2 hover:bg-sky-2 transition-colors text-left">
            + Add New Staff
          </button>
          <button className="w-full bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] hover:bg-sky-2 transition-colors text-left">
            📄 Generate Report
          </button>
        </Panel>
      </div>

      {/* Urgent shifts table */}
      <Panel
        title="Urgent Shifts"
        action={<span className="text-[11px] font-bold text-navy-2 cursor-pointer hover:underline">View all</span>}
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
              {URGENT_SHIFTS.map((row) => (
                <tr key={row.shift} className="cursor-pointer">
                  <td className="font-semibold">{row.shift}</td>
                  <td>{row.location}</td>
                  <td>{row.date}</td>
                  <td>{row.specialty}</td>
                  <td><Badge label={row.status} variant={row.variant} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </Layout>
  );
}
