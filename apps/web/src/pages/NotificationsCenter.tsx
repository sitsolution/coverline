import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import Panel from '../components/ui/Panel';
import TabNav from '../components/ui/TabNav';
import { api } from '../services/api';

const TABS = ['All', 'Unread', 'Shift Alerts', 'Applications', 'System'];

// Tabs that map to the backend `tab` param vs `categories` param
const TAB_PARAM: Record<string, { tab?: string; categories?: string }> = {
  'All':          { tab: 'all' },
  'Unread':       { tab: 'unread' },
  'Shift Alerts': { tab: 'shift_alerts' },
  'Applications': { categories: 'application' },
  'System':       { categories: 'system' },
};

interface NotificationOut {
  id: number;
  title: string;
  body: string;
  category: string;
  isRead: boolean;
  createdAt: string;
}

function categoryIcon(category: string): string {
  switch (category) {
    case 'shift_alert': return '🩺';
    case 'application': return '📥';
    case 'document': return '📄';
    case 'payment': return '💰';
    default: return '⚙️';
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsCenter() {
  const [activeTab, setActiveTab] = useState('All');
  const [notifs, setNotifs] = useState<NotificationOut[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (tab: string) => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', { params: TAB_PARAM[tab] ?? { tab: 'all' } });
      setNotifs(data.items ?? []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeTab); }, [load, activeTab]);

  const handleMarkRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display font-extrabold text-[16.5px] text-ink">Notifications</h1>
        <button
          onClick={handleMarkAllRead}
          className="text-[11.5px] font-bold text-navy-2 hover:underline"
        >
          Mark all read
        </button>
      </div>

      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <Panel className="py-[6px] px-4">
        {loading ? (
          <p className="text-center text-[12px] text-slate py-6">Loading…</p>
        ) : notifs.length === 0 ? (
          <p className="text-center text-[12px] text-slate py-6">No notifications.</p>
        ) : notifs.map((n) => (
          <div
            key={n.id}
            className={`flex gap-[10px] items-start py-[11px] border-b border-line last:border-0 cursor-pointer ${!n.isRead ? 'bg-sky rounded-[8px] px-2' : ''}`}
            onClick={() => !n.isRead && handleMarkRead(n.id)}
          >
            <div className="w-9 h-9 rounded-full bg-sky flex items-center justify-center text-[16px] flex-shrink-0">
              {categoryIcon(n.category)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-[12.5px] text-ink">{n.title}</p>
              <p className="text-[11px] text-slate mt-[2px]">{n.body} · {timeAgo(n.createdAt)}</p>
            </div>
            {!n.isRead && (
              <span className="w-2 h-2 rounded-full bg-navy mt-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </Panel>
    </Layout>
  );
}
