import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import KpiCard from '../components/ui/KpiCard';
import Panel from '../components/ui/Panel';

const BAR_HEIGHTS = [50, 70, 60, 85, 65, 90, 75];

export default function Reports() {
  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Reports &amp; Analytics</h1>
          <p className="text-[11.5px] text-slate mb-4">1 Sep – 27 Sep 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="border-[1.5px] border-navy text-navy text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] bg-transparent">
            Export PDF
          </button>
          <button className="border-[1.5px] border-navy text-navy text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] bg-transparent">
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3 mb-[18px]">
        <KpiCard label="Fill Rate" value="82.5%" delta="+4pts vs last month" />
        <KpiCard label="Avg Time to Fill" value="19 hrs" delta="-3 hrs vs last month" />
        <KpiCard label="Locum Spend" value="₹6.1L" delta="This month" />
        <KpiCard label="Expiring Documents" value="5" delta="Within 30 days" deltaColor="#C97A2B" />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Left — Bar chart */}
        <Panel title="Shifts by Week">
          <div className="flex items-end gap-[10px] h-[120px]">
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="bg-sky-2 rounded-t-[5px] flex-1"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </Panel>

        {/* Right — Top Doctors */}
        <Panel title="Top Doctors by Shifts Completed">
          <div className="overflow-hidden rounded-[10px] border border-line"><table className="adm-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Shifts</th>
                <th>Avg. Rating</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold">Dr. Karan Shah</td>
                <td>31</td>
                <td>4.5★</td>
              </tr>
              <tr>
                <td className="font-semibold">Dr. Ananya Rao</td>
                <td>24</td>
                <td>4.8★</td>
              </tr>
              <tr>
                <td className="font-semibold">Dr. Farhan Ali</td>
                <td>12</td>
                <td>4.3★</td>
              </tr>
            </tbody>
          </table></div>
        </Panel>
      </div>

      {/* Compliance Panel */}
      <Panel title="Compliance — Expiring Documents">
        <div className="overflow-hidden rounded-[10px] border border-line"><table className="adm-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Document</th>
              <th>Expires</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-semibold">Dr. Ananya Rao</td>
              <td>Educational Certificate</td>
              <td>3 Sep 2026</td>
              <td><Badge label="Expired" variant="urgent" /></td>
            </tr>
            <tr>
              <td className="font-semibold">Dr. Karan Shah</td>
              <td>BLS Certification</td>
              <td>15 Oct 2026</td>
              <td><Badge label="Expiring soon" variant="warning" /></td>
            </tr>
          </tbody>
        </table></div>
      </Panel>
    </Layout>
  );
}
