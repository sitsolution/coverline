import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRefresh } from '../../hooks/useRefresh';
import Screen from '../../components/ui/Screen';
import Toast from '../../components/ui/Toast';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/HomeStackNavigator';
import { StaffTabParamList } from '../../navigation/StaffNavigator';
import notificationService, { NotificationOut } from '../../services/notificationService';

type NotificationsNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Notifications'>,
  BottomTabNavigationProp<StaffTabParamList>
>;

type Props = { navigation: NotificationsNavProp };

type TabKey = 'All' | 'Unread' | 'Shift Alerts' | 'Payments';
const TABS: TabKey[] = ['All', 'Unread', 'Shift Alerts', 'Payments'];
const TAB_API: Record<TabKey, 'all' | 'unread' | 'shift_alerts' | 'payments'> = {
  'All': 'all', 'Unread': 'unread', 'Shift Alerts': 'shift_alerts', 'Payments': 'payments',
};

function categoryIcon(category: string): string {
  switch (category) {
    case 'shift_alert': return '🩺';
    case 'application': return '✅';
    case 'payment': return '💰';
    case 'document': return '📄';
    default: return '🔔';
  }
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifRow({ item, isLast, onMarkRead, onPress }: { item: NotificationOut; isLast: boolean; onMarkRead: (id: number) => void; onPress: (item: NotificationOut) => void }) {
  return (
    <TouchableOpacity
      style={[styles.row, isLast && styles.rowLast, !item.isRead && styles.rowUnread]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{categoryIcon(item.category)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.sub}>{item.body} · {timeAgo(item.createdAt)}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [notifs, setNotifs] = useState<NotificationOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const load = useCallback(async (tab: TabKey) => {
    setLoading(true);
    try {
      const res = await notificationService.listNotifications(TAB_API[tab]);
      setNotifs(res.items);
    } catch {
      setToast({ visible: true, message: 'Failed to load notifications.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeTab); }, [load, activeTab]);
  const loadCurrent = useCallback(() => load(activeTab), [load, activeTab]);
  const { refreshing, onRefresh } = useRefresh(loadCurrent);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markRead(id);
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const handlePress = async (item: NotificationOut) => {
    if (!item.isRead) handleMarkRead(item.id);
    if (item.entityId && (item.category === 'shift_alert' || item.category === 'application')) {
      navigation.navigate('Shifts', {
        screen: 'ShiftDetails',
        params: { shiftId: item.entityId },
      });
    } else if (item.category === 'payment' || item.category === 'document') {
      setToast({ visible: true, message: 'No further action needed for this notification.', type: 'info' });
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      setToast({ visible: true, message: 'Could not mark all as read.', type: 'error' });
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>Notifications</Text>
        <View style={styles.spacer} />
        <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.8} disabled={markingAll}>
          <Text style={[styles.markAllText, markingAll && { opacity: 0.4 }]}>
            {markingAll ? 'Marking…' : 'Mark all read'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F3D5C" colors={['#0F3D5C']} />}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabChip, active && styles.tabChipActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color="#0F3D5C" style={{ marginTop: 40 }} />
        ) : notifs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {notifs.map((item, i) => (
              <NotifRow
                key={item.id}
                item={item}
                isLast={i === notifs.length - 1}
                onMarkRead={handleMarkRead}
                onPress={handlePress}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast(t => ({ ...t, visible: false }))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingTop: 6, paddingBottom: 14 },
  backBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#DCE4EA', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, color: '#0F3D5C', lineHeight: 22 },
  appbarTitle: { fontSize: 16.5, fontWeight: '800', color: '#14202E' },
  spacer: { flex: 1 },
  markAllText: { fontSize: 11.5, color: '#175E86', fontWeight: '700' },
  body: { paddingBottom: 24 },
  tabsRow: { gap: 7, paddingHorizontal: 18, marginBottom: 14 },
  tabChip: { backgroundColor: '#EAF2F8', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  tabChipActive: { backgroundColor: '#0F3D5C' },
  tabChipText: { fontSize: 11.5, fontWeight: '700', color: '#175E86' },
  tabChipTextActive: { color: '#fff' },
  list: { paddingHorizontal: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#DCE4EA' },
  rowLast: { borderBottomWidth: 0 },
  rowUnread: { backgroundColor: '#F0F7FD' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EAF2F8', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 16 },
  info: { flex: 1 },
  title: { fontSize: 12.5, fontWeight: '700', color: '#14202E' },
  sub: { fontSize: 11, color: '#5C6B7A', marginTop: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#175E86', flexShrink: 0 },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontSize: 14, fontWeight: '800', color: '#14202E' },
});
