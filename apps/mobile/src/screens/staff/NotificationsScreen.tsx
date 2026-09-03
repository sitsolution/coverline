import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Screen from '../../components/ui/Screen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/HomeStackNavigator';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Notifications'>;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

type TabKey = 'All' | 'Unread' | 'Shift Alerts' | 'Payments';

const TABS: TabKey[] = ['All', 'Unread', 'Shift Alerts', 'Payments'];

type Notif = {
  id: string;
  icon: string;
  title: string;
  sub: string;
  unread?: boolean;
};

const ALL_NOTIFS: Notif[] = [
  { id: '1', icon: '🩺', title: 'New shift matches your profile',  sub: 'Apollo Hospital · Emergency Med. · 2m ago',                    unread: true },
  { id: '2', icon: '✅', title: 'Application confirmed',            sub: 'St. Joseph Hospital shift on Sep 18 · 1h ago' },
  { id: '3', icon: '💰', title: 'Payment received',                 sub: '₹9,500 credited for Apollo Hospital shift · 3h ago' },
  { id: '4', icon: '⚠️', title: 'Document expiring soon',           sub: 'MBBS certificate expires in 7 days · 1d ago' },
];

const TAB_DATA: Record<TabKey, Notif[]> = {
  'All':          ALL_NOTIFS,
  'Unread':       ALL_NOTIFS.filter(n => n.unread),
  'Shift Alerts': ALL_NOTIFS.filter(n => ['🩺','✅'].includes(n.icon)),
  'Payments':     ALL_NOTIFS.filter(n => n.icon === '💰'),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function NotifRow({ item, isLast }: { item: Notif; isLast: boolean }) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.sub}>{item.sub}</Text>
      </View>
      {item.unread && <View style={styles.unreadDot} />}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function NotificationsScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const notifs = TAB_DATA[activeTab];

  return (
    <Screen style={styles.container}>
      {/* App Bar */}
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>Notifications</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Tabs */}
        <View style={styles.segmented}>
          {TABS.map(tab => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.seg, active && styles.segActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.segText, active && styles.segTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notification rows — transparent, no card */}
        {notifs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySub}>You're all caught up.</Text>
          </View>
        ) : (
          notifs.map((n, i) => (
            <NotifRow key={n.id} item={n} isLast={i === notifs.length - 1} />
          ))
        )}

        {/* Mark all as read */}
        {notifs.length > 0 && (
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.markRead}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </Screen>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },

  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
  },
  backBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: '#0F3D5C', lineHeight: 22 },
  appbarTitle: { fontSize: 16.5, fontWeight: '800', color: '#14202E' },
  spacer: { flex: 1 },

  body: { paddingHorizontal: 18, paddingBottom: 28 },

  // Segmented
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#EAF2F8',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  seg: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 8,
  },
  segActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segText: { fontSize: 11.5, fontWeight: '700', color: '#175E86' },
  segTextActive: { color: '#0B2D45' },

  // Notification rows — transparent, no card
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE4EA',
  },
  rowLast: { borderBottomWidth: 0 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 16 },
  info: { flex: 1 },
  title: { fontSize: 12.5, fontWeight: '700', color: '#14202E' },
  sub:   { fontSize: 11, color: '#5C6B7A', marginTop: 1 },

  // Unread dot — 8×8 navy circle
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F3D5C',
    flexShrink: 0,
  },

  // Mark all as read
  markRead: {
    textAlign: 'center',
    fontSize: 11.5,
    fontWeight: '700',
    color: '#175E86',
    marginTop: 14,
  },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 34, marginBottom: 14 },
  emptyTitle: { fontSize: 13.5, fontWeight: '700', color: '#14202E', marginBottom: 6 },
  emptySub: { fontSize: 11.5, color: '#5C6B7A' },
});
