import { useState } from 'react';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import KpiCard from '../components/ui/KpiCard';
import Panel from '../components/ui/Panel';
import TabNav from '../components/ui/TabNav';

const TABS = ['Overview', 'Professional Details', 'Documents', 'Shift History', 'Reviews', 'Notes'];

export default function StaffProfile() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <Layout>
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-[16px] bg-sky flex items-center justify-center font-extrabold text-[20px] text-navy flex-shrink-0">
          AR
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-[2px]">
            <span className="font-extrabold text-[15px] text-ink">Dr. Ananya Rao</span>
            <Badge label="Verified" variant="success" />
          </div>
          <p className="text-[11.5px] text-slate">Emergency Medicine · 4.8★ · Pune, Maharashtra</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="border-[1.5px] border-navy text-navy text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] bg-transparent">
            📞 Call
          </button>
          <button className="border-[1.5px] border-navy text-navy text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] bg-transparent">
            ✉ Message
          </button>
        </div>
      </div>

      {/* Tab Nav */}
      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3 mb-[18px]">
        <KpiCard label="Total Shifts" value="24" delta="All-time" />
        <KpiCard label="Completion Rate" value="96%" delta="Above network avg" />
        <KpiCard label="Response Time" value="12 min" delta="Median" />
        <KpiCard label="Rating" value="4.8★" delta="24 reviews" />
      </div>

      {/* Recent Shifts */}
      <Panel title="Recent Shifts">
        <div className="overflow-hidden rounded-[10px] border border-line"><table className="adm-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Facility</th>
              <th>Status</th>
              <th>Rating Given</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>12 Sep</td>
              <td>Apollo Hospital</td>
              <td><Badge label="Completed" variant="neutral" /></td>
              <td>5★</td>
            </tr>
            <tr>
              <td>5 Sep</td>
              <td>St. Joseph Hospital</td>
              <td><Badge label="Completed" variant="neutral" /></td>
              <td>5★</td>
            </tr>
          </tbody>
        </table></div>
      </Panel>
    </Layout>
  );
}
