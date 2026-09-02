import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ShiftsStackParamList } from '../../navigation/ShiftsStackNavigator';

type Props = {
  navigation: NativeStackNavigationProp<ShiftsStackParamList, 'MyApplications'>;
};

// ─── Types & Data ─────────────────────────────────────────────────────────────

type TabKey = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

const TABS: TabKey[] = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

type Application = {
  id: string;
  initials: string;
  hname: string;
  hloc: string;
  date: string;
  time: string;
  spec: string;
  dur: string;
  pay: string;
};

const DATA: Record<TabKey, Application[]> = {
  Pending: [
    { id: '1', initials: 'SJ', hname: 'St. Joseph Hospital', hloc: 'Kalyani Nagar', date: 'Sep 18', time: '9 AM–5 PM', spec: 'General Med.', dur: '8 hrs', pay: '₹7,000' },
    { id: '2', initials: 'CV', hname: 'CityCare Clinic',     hloc: 'Viman Nagar',   date: 'Sep 20', time: '9 AM–6 PM', spec: 'Pediatrics',   dur: '9 hrs', pay: '₹6,200' },
  ],
  Confirmed: [
    { id: '3', initials: 'AH', hname: 'Apollo Hospital',      hloc: 'Kothrud, Pune', date: 'Sep 14', time: '8 PM–8 AM', spec: 'Emergency Med.', dur: '12 hrs', pay: '₹9,500' },
  ],
  Completed: [
    { id: '4', initials: 'RM', hname: 'Ruby Medical Centre',  hloc: 'Wakad, Pune',   date: 'Sep 8',  time: '8 AM–4 PM', spec: 'Anaesthesia',    dur: '8 hrs',  pay: '₹8,800' },
  ],
  Cancelled: [],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function AppCard({
  item,
  tab,
}: {
  item: Application;
  tab: TabKey;
}) {
  const badgeStyle =
    tab === 'Confirmed' ? { bg: '#E3F5EC', color: '#1F8A5F' } :
    tab === 'Completed' ? { bg: '#EAF2F8', color: '#175E86' } :
    tab === 'Cancelled' ? { bg: '#FBE7E4', color: '#C0392B' } :
    { bg: '#FBECDC', color: '#C97A2B' }; // Pending = Applied

  return (
    <View style={styles.card}>
      {/* Row 1: hospital + badge */}
      <View style={styles.cardRow1}>
        <View style={styles.hosp}>
          <View style={styles.logoChip}>
            <Text style={styles.logoChipText}>{item.initials}</Text>
          </View>
          <View>
            <Text style={styles.hname}>{item.hname}</Text>
            <Text style={styles.hloc}>{item.hloc}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
          <Text style={[styles.badgeText, { color: badgeStyle.color }]}>
            {tab === 'Pending' ? 'Applied' : tab}
          </Text>
        </View>
      </View>

      {/* Meta pills */}
      <View style={styles.meta}>
        <Text style={styles.metaPill}>📅 {item.date}</Text>
        <Text style={styles.metaPill}>⏰ {item.time}</Text>
        <Text style={styles.metaPill}>💊 {item.spec}</Text>
        <Text style={styles.metaPill}>⏱ {item.dur}</Text>
      </View>

      {/* Footer */}
      <View style={styles.cardFoot}>
        <Text style={styles.pay}>{item.pay}</Text>
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function MyApplicationsScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('Pending');
  const items = DATA[activeTab];

  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar */}
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>My Applications</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Segmented tabs */}
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

        {/* Cards */}
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No {activeTab} applications</Text>
            <Text style={styles.emptySub}>Your {activeTab.toLowerCase()} applications will appear here.</Text>
          </View>
        ) : (
          items.map((item, index) => (
            <View key={item.id}>
              <AppCard item={item} tab={activeTab} />

              {/* Action buttons — shown for each Pending card */}
              {activeTab === 'Pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.8}>
                    <Text style={styles.outlineBtnText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dangerBtn} activeOpacity={0.8}>
                    <Text style={styles.dangerBtnText}>Cancel Application</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
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

  body: { paddingHorizontal: 18, paddingBottom: 24 },

  // Segmented tabs — text labels, same sky bg / white active pattern
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

  // Card
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    borderRadius: 12,
    padding: 13,
    marginBottom: 10,
  },
  cardRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hosp: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  logoChip: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EAF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoChipText: { fontSize: 12, fontWeight: '800', color: '#0F3D5C' },
  hname: { fontSize: 12.8, fontWeight: '700', color: '#14202E' },
  hloc:  { fontSize: 11, color: '#5C6B7A', marginTop: 1 },

  badge: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, flexShrink: 0 },
  badgeText: { fontSize: 10.5, fontWeight: '700' },

  // Meta
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  metaPill: {
    fontSize: 10.8,
    color: '#5C6B7A',
    backgroundColor: '#F5F8FA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  // Footer
  cardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pay: { fontSize: 13.5, fontWeight: '800', color: '#0B2D45' },

  // Action buttons row — margin:-6px 0 14px (pull up tight to card)
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -6,
    marginBottom: 14,
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: '#0F3D5C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  outlineBtnText: { fontSize: 11.5, fontWeight: '700', color: '#0F3D5C' },
  dangerBtn: {
    backgroundColor: '#FBE7E4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  dangerBtnText: { fontSize: 11.5, fontWeight: '700', color: '#C0392B' },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  emptyIcon: { fontSize: 34, marginBottom: 14 },
  emptyTitle: { fontSize: 13.5, fontWeight: '700', color: '#14202E', marginBottom: 6 },
  emptySub: { fontSize: 11.5, color: '#5C6B7A', textAlign: 'center' },
});
