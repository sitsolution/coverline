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
import { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';
import activityService, { ActivityStats, ActivityLogItem } from '../../services/activityService';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'MyActivity'>;
};

// ─── Action display config ────────────────────────────────────────────────────

type BadgeVariant = 'green' | 'amber' | 'blue' | 'red' | 'grey';

function actionConfig(action: string): { icon: string; label: string; variant: BadgeVariant } {
  switch (action) {
    case 'shift_applied':       return { icon: '📋', label: 'Applied',   variant: 'amber' };
    case 'booking_confirmed':   return { icon: '✅', label: 'Confirmed', variant: 'green' };
    case 'booking_completed':   return { icon: '🏁', label: 'Completed', variant: 'green' };
    case 'application_cancelled': return { icon: '✕',  label: 'Cancelled', variant: 'red'  };
    case 'document_uploaded':   return { icon: '📄', label: 'Uploaded',  variant: 'blue'  };
    case 'document_verified':   return { icon: '✓',  label: 'Verified',  variant: 'green' };
    case 'document_rejected':   return { icon: '✕',  label: 'Rejected',  variant: 'red'   };
    case 'availability_updated':return { icon: '📅', label: 'Updated',   variant: 'grey'  };
    default:                    return { icon: '•',  label: 'Activity',  variant: 'grey'  };
  }
}

const BADGE_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  green: { bg: '#E3F5EC', text: '#1F8A5F' },
  amber: { bg: '#FBECDC', text: '#C97A2B' },
  blue:  { bg: '#EAF2F8', text: '#175E86' },
  red:   { bg: '#FBE7E4', text: '#C0392B' },
  grey:  { bg: '#F0F4F7', text: '#5C6B7A' },
};

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  1) return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActivityRow({ item, isLast }: { item: ActivityLogItem; isLast: boolean }) {
  const { icon, label, variant } = actionConfig(item.action);
  const colors = BADGE_COLORS[variant];

  return (
    <View style={[styles.actRow, isLast && styles.actRowLast]}>
      <View style={styles.actIcon}>
        <Text style={styles.actIconText}>{icon}</Text>
      </View>
      <View style={styles.actInfo}>
        <Text style={styles.actDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.actTime}>{timeAgo(item.createdAt)}</Text>
      </View>
      <View style={[styles.actBadge, { backgroundColor: colors.bg }]}>
        <Text style={[styles.actBadgeText, { color: colors.text }]}>{label}</Text>
      </View>
    </View>
  );
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

function WeeklyChart({ items }: { items: ActivityLogItem[] }) {
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Count activity items per weekday (0=Mon … 6=Sun) for the last 7 days
  const today = new Date();
  const counts = Array(7).fill(0);
  items.forEach((item) => {
    const date = new Date(item.createdAt);
    const diffDays = Math.floor((today.getTime() - date.getTime()) / 86400000);
    if (diffDays >= 0 && diffDays < 7) {
      // Map to Mon–Sun index
      const dayIndex = (date.getDay() + 6) % 7; // JS 0=Sun → 0=Mon
      counts[dayIndex]++;
    }
  });

  const maxCount = Math.max(...counts, 1);
  const BAR_MAX_HEIGHT = 56;

  return (
    <View style={styles.chart}>
      {counts.map((count, i) => {
        const height = Math.max(6, (count / maxCount) * BAR_MAX_HEIGHT);
        const isToday = i === (new Date().getDay() + 6) % 7;
        return (
          <View key={i} style={styles.barCol}>
            <View style={[
              styles.bar,
              { height },
              isToday && styles.barToday,
            ]} />
            <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>{DAY_LABELS[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function MyActivityScreen({ navigation }: Props) {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [items, setItems] = useState<ActivityLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState({
    visible: false, message: '', type: 'error' as 'success' | 'error' | 'info',
  });

  const INITIAL_LIMIT = 10;

  const load = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([
        activityService.getStats(),
        activityService.getActivity(INITIAL_LIMIT, 0),
      ]);
      setStats(s);
      setItems(a.items);
      setTotal(a.total);
    } catch {
      setToast({ visible: true, message: 'Failed to load activity.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const { refreshing, onRefresh } = useRefresh(load);

  const handleLoadMore = async () => {
    if (loadingMore || items.length >= total) return;
    setLoadingMore(true);
    try {
      const res = await activityService.getActivity(20, items.length);
      setItems(prev => [...prev, ...res.items]);
      setTotal(res.total);
    } catch {
      setToast({ visible: true, message: 'Failed to load more.', type: 'error' });
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <Screen style={styles.container}>
        <View style={styles.appbar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.appbarTitle}>My Activity</Text>
          <View style={styles.spacer} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0F3D5C" />
        </View>
      </Screen>
    );
  }

  const hasMore = items.length < total;

  return (
    <Screen style={styles.container}>
      {/* App Bar */}
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>My Activity</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F3D5C" colors={['#0F3D5C']} />
        }
      >
        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard label="Shifts Completed"   value={String(stats?.shiftsCompleted ?? 0)} />
          <StatCard label="Hours Worked"        value={`${stats?.hoursWorked ?? 0}h`} />
          <StatCard label="Pending Applications" value={String(stats?.pendingApplications ?? 0)} />
          <StatCard label="Completion Rate"     value={`${stats?.completionRate ?? 0}%`} />
        </View>

        {/* Weekly activity chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>This Week's Activity</Text>
          <WeeklyChart items={items} />
        </View>

        {/* Activity feed */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptySub}>Your shift applications, documents, and availability updates will appear here.</Text>
          </View>
        ) : (
          <View style={styles.feedCard}>
            {items.map((item, i) => (
              <ActivityRow key={item.id} item={item} isLast={i === items.length - 1} />
            ))}
          </View>
        )}

        {/* Load more */}
        {hasMore && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore} activeOpacity={0.8} disabled={loadingMore}>
            {loadingMore
              ? <ActivityIndicator color="#175E86" size="small" />
              : <Text style={styles.loadMoreText}>View Full Activity History</Text>
            }
          </TouchableOpacity>
        )}

        <View style={{ height: 24 }} />
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },

  appbar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 18, paddingTop: 6, paddingBottom: 14,
  },
  backBtn: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#DCE4EA', alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: '#0F3D5C', lineHeight: 22 },
  appbarTitle: { fontSize: 16.5, fontWeight: '800', color: '#14202E' },
  spacer: { flex: 1 },

  body: { paddingHorizontal: 18, paddingBottom: 20 },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard: {
    width: '47.5%', backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#DCE4EA', padding: 13,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#0B2D45', marginBottom: 3 },
  statLabel: { fontSize: 10.5, color: '#5C6B7A', fontWeight: '500' },

  // Chart
  chartCard: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1,
    borderColor: '#DCE4EA', padding: 14, marginBottom: 20,
  },
  chartTitle: { fontSize: 12, fontWeight: '700', color: '#14202E', marginBottom: 14 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 72 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  bar: {
    width: '100%', backgroundColor: '#D8E9F3',
    borderTopLeftRadius: 4, borderTopRightRadius: 4,
  },
  barToday: { backgroundColor: '#0F3D5C' },
  barLabel: { fontSize: 9.5, color: '#8697A6', fontWeight: '600' },
  barLabelToday: { color: '#0F3D5C' },

  // Section title
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#14202E', marginBottom: 10 },

  // Feed card
  feedCard: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#DCE4EA',
  },
  actRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#EEF3F8',
  },
  actRowLast: { borderBottomWidth: 0 },
  actIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EEF3F8', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  actIconText: { fontSize: 14 },
  actInfo: { flex: 1 },
  actDesc: { fontSize: 12.5, fontWeight: '600', color: '#14202E', marginBottom: 2 },
  actTime: { fontSize: 10.5, color: '#8697A6' },
  actBadge: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, flexShrink: 0 },
  actBadgeText: { fontSize: 10.5, fontWeight: '700' },

  // Empty state
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 34, marginBottom: 10 },
  emptyTitle: { fontSize: 14, fontWeight: '800', color: '#14202E', marginBottom: 4 },
  emptySub: { fontSize: 12, color: '#5C6B7A', textAlign: 'center', lineHeight: 18 },

  // Load more
  loadMoreBtn: {
    alignItems: 'center', paddingVertical: 14, marginTop: 12,
    borderWidth: 1.4, borderColor: '#DCE4EA', borderRadius: 10,
    backgroundColor: '#fff',
  },
  loadMoreText: { fontSize: 12.5, fontWeight: '700', color: '#175E86' },
});
