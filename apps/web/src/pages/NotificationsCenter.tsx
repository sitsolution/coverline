import { useState } from 'react';
import Layout from '../components/layout/Layout';
import Panel from '../components/ui/Panel';
import TabNav from '../components/ui/TabNav';

const TABS = ['All', 'Unread', 'Shift Alerts', 'Applications', 'System'];

const NOTIFICATIONS = [
  {
    icon: '🩺',
    title: 'ER Night Cover shift is still unfilled',
    sub: '12 hours until shift start · 10m ago',
    unread: true,
  },
  {
    icon: '📥',
    title: 'New application from Dr. Farhan Ali',
    sub: 'ICU Relief shift · 40m ago',
    unread: true,
  },
  {
    icon: '📄',
    title: 'Document verification requested',
    sub: 'Dr. Riya Iyer submitted Medical License · 2h ago',
    unread: false,
  },
  {
    icon: '⚙️',
    title: 'Scheduled maintenance tonight, 1–2 AM IST',
    sub: 'System · 5h ago',
    unread: false,
  },
];

export default function NotificationsCenter() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <Layout>
      {/* Header */}
      <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-4">Notifications</h1>

      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <Panel className="py-[6px] px-4">
        {NOTIFICATIONS.map((n, i) => (
          <div key={i} className="flex gap-[10px] items-start py-[11px] border-b border-line last:border-0">
            <div className="w-9 h-9 rounded-full bg-sky flex items-center justify-center text-[16px] flex-shrink-0">
              {n.icon}
            </div>
            <div className="flex-1">
              <p className="font-bold text-[12.5px] text-ink">{n.title}</p>
              <p className="text-[11px] text-slate mt-[2px]">{n.sub}</p>
            </div>
            {n.unread && (
              <span className="w-2 h-2 rounded-full bg-navy mt-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </Panel>
    </Layout>
  );
}
