import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import Panel from '../components/ui/Panel';
import TabNav from '../components/ui/TabNav';

const TABS = ['All', 'Pending', 'Confirmed', 'Upcoming', 'Completed', 'Cancelled'];

type BadgeVariant = 'success' | 'warning' | 'urgent' | 'info' | 'gold' | 'neutral' | 'default';

const ROWS: {
  id: string; shift: string; doctor: string; date: string;
  status: string; tab: string; statusVariant: BadgeVariant; actions: string[];
}[] = [
  { id: '#BK-8821', shift: 'ER Night Cover · Sep 14',   doctor: 'Dr. Ananya Rao',  date: '12 Sep', status: 'Confirmed',  tab: 'Confirmed',  statusVariant: 'success', actions: ['View', 'Contact'] },
  { id: '#BK-8820', shift: 'OPD Weekend · Sep 13',       doctor: 'Dr. Karan Shah',  date: '10 Sep', status: 'Confirmed',  tab: 'Confirmed',  statusVariant: 'success', actions: ['View', 'Contact'] },
  { id: '#BK-8817', shift: 'ICU Night · Sep 17',         doctor: 'Dr. Farhan Ali',  date: '13 Sep', status: 'Upcoming',   tab: 'Upcoming',   statusVariant: 'info',    actions: ['View', 'Contact'] },
  { id: '#BK-8816', shift: 'Paediatric OPD · Sep 20',    doctor: 'Dr. Riya Iyer',   date: '14 Sep', status: 'Upcoming',   tab: 'Upcoming',   statusVariant: 'info',    actions: ['View', 'Contact'] },
  { id: '#BK-8815', shift: 'Cardiology OPD · Sep 16',    doctor: 'Dr. Meera Nair',  date: '11 Sep', status: 'Pending',    tab: 'Pending',    statusVariant: 'warning', actions: ['View', 'Contact'] },
  { id: '#BK-8814', shift: 'Anaesthesia Cover · Sep 18', doctor: 'Dr. K. Shah',     date: '9 Sep',  status: 'Pending',    tab: 'Pending',    statusVariant: 'warning', actions: ['View', 'Contact'] },
  { id: '#BK-8819', shift: 'ICU Relief · Sep 10',        doctor: 'Dr. Farhan Ali',  date: '8 Sep',  status: 'Completed',  tab: 'Completed',  statusVariant: 'neutral', actions: ['View'] },
  { id: '#BK-8813', shift: 'General OPD · Sep 5',        doctor: 'Dr. Ananya Rao',  date: '3 Sep',  status: 'Completed',  tab: 'Completed',  statusVariant: 'neutral', actions: ['View'] },
  { id: '#BK-8818', shift: 'General OPD · Sep 8',        doctor: 'Dr. Riya Iyer',   date: '5 Sep',  status: 'Cancelled',  tab: 'Cancelled',  statusVariant: 'urgent',  actions: ['View'] },
  { id: '#BK-8812', shift: 'Weekend OPD · Sep 6',        doctor: 'Dr. Vikram Nair', date: '2 Sep',  status: 'Cancelled',  tab: 'Cancelled',  statusVariant: 'urgent',  actions: ['View'] },
];

export default function Bookings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All' ? ROWS : ROWS.filter((r) => r.tab === activeTab);

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Shift Bookings</h1>
          <p className="text-[11.5px] text-slate mb-4">All confirmed and past bookings</p>
        </div>
        <button className="border-[1.5px] border-navy text-navy text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] bg-transparent">
          ⬇ Export to CSV
        </button>
      </div>

      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <Panel>
        <div className="overflow-hidden rounded-[10px] border border-line">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Shift</th>
              <th>Doctor</th>
              <th>Booking Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-[12px] text-slate py-8">No bookings found.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id}>
                <td className="font-semibold">{r.id}</td>
                <td>{r.shift}</td>
                <td>{r.doctor}</td>
                <td>{r.date}</td>
                <td><Badge label={r.status} variant={r.statusVariant} /></td>
                <td className="text-[12px]">
                  {r.actions.map((a, i) => (
                    <span key={a}>
                      {i > 0 && ' · '}
                      <span
                        className="text-navy-2 font-semibold cursor-pointer hover:underline"
                        onClick={() => a === 'View' && navigate(`/bookings/${r.id.replace('#', '')}`)}
                      >{a}</span>
                    </span>
                  ))}
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
