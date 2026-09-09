import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import KpiCard from '../components/ui/KpiCard';
import Panel from '../components/ui/Panel';
import adminDashboardService, { ReportsResponse } from '../services/adminDashboardService';

function deltaToneColor(tone: string): string {
  if (tone === 'positive') return '#1F8A5F';
  if (tone === 'negative') return '#C0392B';
  if (tone === 'warning') return '#C97A2B';
  return '#5C6B7A';
}

function dateLabel(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Reports() {
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDashboardService.getReports().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const bars = data?.shiftsByWeek ?? [];
  const maxBar = bars.length ? Math.max(...bars.map(b => b.value), 1) : 1;

  const exportCsv = () => {
    if (!data) return;
    const rows: string[][] = [
      ['Report', `Reports & Analytics — ${data.periodLabel}`],
      [],
      ['KPIs'],
      ['Metric', 'Value'],
      ...data.kpis.map(k => [k.label, k.value]),
      [],
      ['Top Doctors'],
      ['Doctor', 'Shifts Completed', 'Avg Rating'],
      ...data.topStaff.map(s => [s.name, String(s.shiftsCompleted), s.rating.toFixed(1)]),
      [],
      ['Expiring Documents'],
      ['Doctor', 'Document', 'Expires', 'Status'],
      ...data.expiringDocuments.map(d => [d.staffName, d.documentType, dateLabel(d.expiresOn), d.status]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${data.periodLabel.replace(' ', '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Reports &amp; Analytics</h1>
          <p className="text-[11.5px] text-slate mb-4">{data?.periodLabel ?? '…'}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            disabled={!data}
            className="border border-line bg-white text-slate text-[11.5px] font-semibold px-3 py-[7px] rounded-[8px] hover:border-navy-2 disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3 mb-[18px]">
        {loading
          ? Array(4).fill(null).map((_, i) => <KpiCard key={i} label="…" value="—" delta="" />)
          : (data?.kpis ?? []).map(k => (
              <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} deltaColor={deltaToneColor(k.deltaTone)} />
            ))
        }
      </div>

      {/* Two-column layout */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Left — Bar chart */}
        <Panel title="Shifts by Week">
          <div className="flex items-end gap-[10px] h-[120px]">
            {loading
              ? Array(7).fill(null).map((_, i) => <div key={i} className="bg-sky-2 rounded-t-[5px] flex-1" style={{ height: '50%' }} />)
              : bars.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-[4px]" style={{ height: '100%', justifyContent: 'flex-end' }}>
                    <div
                      className="bg-navy-2 rounded-t-[5px] w-full"
                      style={{ height: `${Math.max(6, (b.value / maxBar) * 100)}%` }}
                      title={`${b.label}: ${b.value} shifts`}
                    />
                    <span className="text-[9.5px] text-slate">{b.label}</span>
                  </div>
                ))
            }
          </div>
        </Panel>

        {/* Right — Top Doctors */}
        <Panel title="Top Doctors by Shifts Completed">
          <div className="overflow-hidden rounded-[10px] border border-line">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Shifts</th>
                  <th>Avg. Rating</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center text-[12px] text-slate py-4">Loading…</td></tr>
                ) : (data?.topStaff ?? []).length === 0 ? (
                  <tr><td colSpan={3} className="text-center text-[12px] text-slate py-4">No data yet.</td></tr>
                ) : (data?.topStaff ?? []).map((s) => (
                  <tr key={s.staffId}>
                    <td className="font-semibold">{s.name}</td>
                    <td>{s.shiftsCompleted}</td>
                    <td>{s.rating.toFixed(1)}★</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* Compliance Panel */}
      <Panel title="Compliance — Expiring Documents">
        <div className="overflow-hidden rounded-[10px] border border-line">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Document</th>
                <th>Expires</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center text-[12px] text-slate py-4">Loading…</td></tr>
              ) : (data?.expiringDocuments ?? []).length === 0 ? (
                <tr><td colSpan={4} className="text-center text-[12px] text-slate py-4">No expiring documents.</td></tr>
              ) : (data?.expiringDocuments ?? []).map((d) => (
                <tr key={d.documentId}>
                  <td className="font-semibold">{d.staffName}</td>
                  <td>{d.documentType}</td>
                  <td>{dateLabel(d.expiresOn)}</td>
                  <td><Badge label={d.status} variant={d.status === 'Expired' ? 'urgent' : 'warning'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </Layout>
  );
}
