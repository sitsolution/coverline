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
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';
import earningsService, {
  EarningsSummary,
  TrendPoint,
  TransactionOut,
} from '../../services/earningsService';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Earnings'>;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatINR(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function txDate(isoString: string) {
  return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ label, variant }: { label: string; variant: 'success' | 'warning' | 'neutral' }) {
  const bg    = variant === 'success' ? '#E3F5EC' : variant === 'warning' ? '#FBECDC' : '#EAF2F8';
  const color = variant === 'success' ? '#1F8A5F' : variant === 'warning' ? '#C97A2B' : '#5C6B7A';
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function badgeVariant(status: string): 'success' | 'warning' | 'neutral' {
  if (status === 'paid') return 'success';
  if (status === 'pending') return 'warning';
  return 'neutral';
}

function TransactionRow({ item, isLast }: { item: TransactionOut; isLast: boolean }) {
  const initials = item.facilityInitials ?? '??';
  const title = item.facilityName ?? 'Unknown';
  const sub = `${txDate(item.earnedAt)} · ${item.specialty ?? 'Shift'}`;
  return (
    <View style={[styles.txRow, isLast && styles.txRowLast]}>
      <View style={styles.txAvatar}>
        <Text style={styles.txAvatarText}>{initials}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txTitle}>{title}</Text>
        <Text style={styles.txSub}>{sub}</Text>
      </View>
      <View style={styles.txRight}>
        <Text style={styles.txAmount}>{formatINR(item.amount)}</Text>
        <Badge label={item.status.charAt(0).toUpperCase() + item.status.slice(1)} variant={badgeVariant(item.status)} />
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function EarningsScreen({ navigation }: Props) {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [transactions, setTransactions] = useState<TransactionOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingOut, setPayingOut] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const load = useCallback(async () => {
    try {
      const [s, t, tx] = await Promise.all([
        earningsService.getSummary(),
        earningsService.getTrend(7),
        earningsService.getTransactions(10, 0),
      ]);
      setSummary(s);
      setTrend(t);
      setTransactions(tx.items);
    } catch {
      setToast({ visible: true, message: 'Failed to load earnings.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const { refreshing, onRefresh } = useRefresh(load);

  const handleRequestPayout = async () => {
    setPayingOut(true);
    try {
      await earningsService.requestPayout();
      setToast({ visible: true, message: 'Payout request submitted successfully.', type: 'success' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to request payout.';
      setToast({ visible: true, message: msg, type: 'error' });
    } finally {
      setPayingOut(false);
    }
  };

  // Compute bar heights as percentages relative to max trend value
  const maxTrend = trend.length > 0 ? Math.max(...trend.map(p => p.amount), 1) : 1;
  const barHeights = trend.map(p => Math.max(8, (p.amount / maxTrend) * 80));

  if (loading) {
    return (
      <Screen style={styles.container}>
        <View style={styles.appbar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.appbarTitle}>My Earnings</Text>
          <View style={styles.spacer} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0F3D5C" />
        </View>
      </Screen>
    );
  }

  const nextPayout = summary?.nextPayoutDate
    ? new Date(summary.nextPayoutDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '—';

  return (
    <Screen style={styles.container}>
      {/* App Bar */}
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>My Earnings</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F3D5C" colors={['#0F3D5C']} />}>

        {/* Hero gradient card */}
        <LinearGradient
          colors={['#0F3D5C', '#175E86']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroLabel}>Total Earnings (All Time)</Text>
          <Text style={styles.heroAmount}>{formatINR(summary?.totalEarnings ?? 0)}</Text>
          <View style={styles.heroStats}>
            <View>
              <Text style={styles.heroStatLabel}>This Month</Text>
              <Text style={styles.heroStatValue}>{formatINR(summary?.thisMonth ?? 0)}</Text>
            </View>
            <View>
              <Text style={styles.heroStatLabel}>Pending</Text>
              <Text style={styles.heroStatValue}>{formatINR(summary?.pending ?? 0)}</Text>
            </View>
            <View>
              <Text style={styles.heroStatLabel}>Next Payout</Text>
              <Text style={styles.heroStatValue}>{nextPayout}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Earnings Trend */}
        {trend.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Earnings Trend</Text>
            <View style={styles.chart}>
              {barHeights.map((h, i) => (
                <View key={i} style={[styles.bar, { height: h }]} />
              ))}
            </View>
          </>
        )}

        {/* Recent Transactions */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet.</Text>
        ) : (
          transactions.map((tx, i) => (
            <TransactionRow key={tx.id} item={tx} isLast={i === transactions.length - 1} />
          ))
        )}

        {/* Withdraw button */}
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={handleRequestPayout} disabled={payingOut}>
          <Text style={styles.primaryBtnText}>{payingOut ? 'Requesting…' : 'Withdraw / Request Payout'}</Text>
        </TouchableOpacity>
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

  // Hero card
  heroCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  heroLabel:  { fontSize: 10.5, color: '#BFD6E5' },
  heroAmount: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 2, marginBottom: 12 },
  heroStats:  { flexDirection: 'row', justifyContent: 'space-between' },
  heroStatLabel: { fontSize: 10.5, color: '#DCEAF3' },
  heroStatValue: { fontSize: 12, fontWeight: '700', color: '#fff', marginTop: 2 },

  // Section title
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#14202E',
    marginTop: 18,
    marginBottom: 10,
  },

  emptyText: { fontSize: 12, color: '#8697A6', textAlign: 'center', paddingVertical: 14 },

  // Bar chart
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 80,
    marginBottom: 20,
  },
  bar: {
    flex: 1,
    backgroundColor: '#D8E9F3',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },

  // Transaction rows
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE4EA',
  },
  txRowLast: { borderBottomWidth: 0 },
  txAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txAvatarText: { fontSize: 12, fontWeight: '800', color: '#0F3D5C' },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 12.5, fontWeight: '700', color: '#14202E' },
  txSub:   { fontSize: 11, color: '#5C6B7A', marginTop: 1 },
  txRight: { alignItems: 'flex-end', flexShrink: 0 },
  txAmount: { fontSize: 12.5, fontWeight: '800', color: '#14202E', marginBottom: 3 },

  // Badge
  badge: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { fontSize: 10.5, fontWeight: '700' },

  // Primary button
  primaryBtn: {
    backgroundColor: '#0F3D5C',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
