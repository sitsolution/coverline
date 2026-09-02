import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Earnings'>;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const BAR_HEIGHTS = [40, 65, 50, 80, 55, 90, 70]; // percentages of 80px container

const TRANSACTIONS = [
  {
    initials: 'AH',
    title: 'Apollo Hospital',
    sub: '12 Sep · Emergency Med. shift',
    amount: '₹9,500',
    badgeLabel: 'Paid',
    badgeVariant: 'success' as const,
  },
  {
    initials: 'SJ',
    title: 'St. Joseph Hospital',
    sub: '8 Sep · General Med. shift',
    amount: '₹7,000',
    badgeLabel: 'Pending',
    badgeVariant: 'warning' as const,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ label, variant }: { label: string; variant: 'success' | 'warning' }) {
  const bg    = variant === 'success' ? '#E3F5EC' : '#FBECDC';
  const color = variant === 'success' ? '#1F8A5F' : '#C97A2B';
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function TransactionRow({
  item,
  isLast,
}: {
  item: typeof TRANSACTIONS[0];
  isLast: boolean;
}) {
  return (
    <View style={[styles.txRow, isLast && styles.txRowLast]}>
      <View style={styles.txAvatar}>
        <Text style={styles.txAvatarText}>{item.initials}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txTitle}>{item.title}</Text>
        <Text style={styles.txSub}>{item.sub}</Text>
      </View>
      <View style={styles.txRight}>
        <Text style={styles.txAmount}>{item.amount}</Text>
        <Badge label={item.badgeLabel} variant={item.badgeVariant} />
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function EarningsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar */}
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>My Earnings</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>

        {/* Hero gradient card */}
        <LinearGradient
          colors={['#0F3D5C', '#175E86']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroLabel}>Total Earnings (All Time)</Text>
          <Text style={styles.heroAmount}>₹4,82,000</Text>
          <View style={styles.heroStats}>
            <View>
              <Text style={styles.heroStatLabel}>This Month</Text>
              <Text style={styles.heroStatValue}>₹45,000</Text>
            </View>
            <View>
              <Text style={styles.heroStatLabel}>Pending</Text>
              <Text style={styles.heroStatValue}>₹9,500</Text>
            </View>
            <View>
              <Text style={styles.heroStatLabel}>Next Payout</Text>
              <Text style={styles.heroStatValue}>28 Sep</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Earnings Trend */}
        <Text style={styles.sectionTitle}>Earnings Trend</Text>
        <View style={styles.chart}>
          {BAR_HEIGHTS.map((pct, i) => (
            <View
              key={i}
              style={[styles.bar, { height: (80 * pct) / 100 }]}
            />
          ))}
        </View>

        {/* Recent Transactions */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {TRANSACTIONS.map((tx, i) => (
          <TransactionRow key={tx.initials} item={tx} isLast={i === TRANSACTIONS.length - 1} />
        ))}

        {/* Withdraw button */}
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Withdraw / Request Payout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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

  // Transaction rows (no card wrapper — transparent)
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
