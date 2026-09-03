import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Screen from '../../components/ui/Screen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/HomeStackNavigator';

type Props = { navigation: NativeStackNavigationProp<HomeStackParamList, 'Dashboard'> };

const ROLES = [
  { label: 'Doctor', icon: '🩺' },
  { label: 'Nurse', icon: '💉' },
  { label: 'OT Tech', icon: '🔧' },
  { label: 'Housekeeping', icon: '🧹' },
];

const STATS = [
  { label: 'Available Shifts', value: '12' },
  { label: 'Upcoming Shifts', value: '3' },
  { label: 'Completed Shifts', value: '24' },
  { label: 'Earnings this Month', value: '₹1,200' },
];

type UrgentShift = {
  id: string;
  initials: string;
  hospital: string;
  location: string;
  date: string;
  time: string;
  role: string;
  duration: string;
  tags: string[];
  pay: string;
};

type RecommendedShift = {
  id: string;
  initials: string;
  hospital: string;
  location: string;
  date: string;
  time: string;
  role: string;
  duration: string;
  pay: string;
};

const URGENT_SHIFTS: UrgentShift[] = [
  {
    id: '1',
    initials: 'AH',
    hospital: 'Apollo Hospital',
    location: 'Kothrud, Pune',
    date: 'Today',
    time: '8 PM–8 AM',
    role: 'OT Housekeeping',
    duration: '12 hrs',
    tags: ['Urgent', 'Night'],
    pay: '₹1,600',
  },
  {
    id: '2',
    initials: 'SJ',
    hospital: "St. John's Hospital",
    location: 'Koregaon Park, Pune',
    date: 'Tomorrow',
    time: '7 AM–3 PM',
    role: 'General Housekeeping',
    duration: '8 hrs',
    tags: ['Urgent'],
    pay: '₹1,200',
  },
  {
    id: '3',
    initials: 'RH',
    hospital: 'Ruby Hall Clinic',
    location: 'Pune, MH',
    date: 'Today',
    time: '9 PM–9 AM',
    role: 'Ward Housekeeping',
    duration: '12 hrs',
    tags: ['Urgent', 'Night'],
    pay: '₹1,800',
  },
];

const RECOMMENDED_SHIFTS: RecommendedShift[] = [
  {
    id: '1',
    initials: 'CV',
    hospital: 'CityCare Clinic',
    location: 'Baner, Pune',
    date: 'Sep 5',
    time: '9 AM–5 PM',
    role: 'General Housekeeping',
    duration: '8 hrs',
    pay: '₹1,000',
  },
  {
    id: '2',
    initials: 'MH',
    hospital: 'Manipal Hospital',
    location: 'Bangalore, KA',
    date: 'Sep 6',
    time: '7 AM–7 PM',
    role: 'ICU Housekeeping',
    duration: '12 hrs',
    pay: '₹1,800',
  },
  {
    id: '3',
    initials: 'NH',
    hospital: 'Narayana Health',
    location: 'Hyderabad, TS',
    date: 'Sep 7',
    time: '8 AM–4 PM',
    role: 'OT Housekeeping',
    duration: '8 hrs',
    pay: '₹1,200',
  },
];

const AVATAR_COLORS = ['#D4E8F5', '#D5EED8', '#EED9F5', '#F5E8D4', '#D4EEF5'];

function HospitalAvatar({ initials }: { initials: string }) {
  return (
    <View style={styles.hospitalAvatar}>
      <Text style={styles.hospitalAvatarText}>{initials}</Text>
    </View>
  );
}

function UrgentShiftCard({ item }: { item: UrgentShift }) {
  return (
    <View style={styles.urgentCard}>
      <View style={styles.cardTopRow}>
        <HospitalAvatar initials={item.initials} />
        <View style={styles.cardTopInfo}>
          <Text style={styles.hospitalName}>{item.hospital}</Text>
          <Text style={styles.hospitalLoc}>📍 {item.location}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}><Text style={styles.metaText}>📅 {item.date}</Text></View>
        <View style={styles.metaPill}><Text style={styles.metaText}>⏰ {item.time}</Text></View>
      </View>

      <View style={[styles.metaRow, { marginTop: 5 }]}>
        <View style={styles.metaPill}><Text style={styles.metaText}>🩺 {item.role}</Text></View>
        <View style={styles.metaPill}><Text style={styles.metaText}>{item.duration}</Text></View>
      </View>

      <View style={[styles.metaRow, { marginTop: 8 }]}>
        {item.tags.map((tag) => (
          <View key={tag} style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardBottomRow}>
        <Text style={styles.shiftPay}>{item.pay}</Text>
        <TouchableOpacity style={styles.applyBtn} activeOpacity={0.85}>
          <Text style={styles.applyBtnText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RecommendedShiftCard({ item }: { item: RecommendedShift }) {
  return (
    <View style={styles.recCard}>
      <View style={styles.cardTopRow}>
        <HospitalAvatar initials={item.initials} />
        <View style={styles.cardTopInfo}>
          <Text style={styles.hospitalName}>{item.hospital}</Text>
          <Text style={styles.hospitalLoc}>📍 {item.location}</Text>
        </View>
        <Text style={styles.shiftPay}>{item.pay}</Text>
      </View>

      <View style={[styles.metaRow, { marginTop: 4 }]}>
        <View style={styles.metaPill}><Text style={styles.metaText}>📅 {item.date}</Text></View>
        <View style={styles.metaPill}><Text style={styles.metaText}>⏰ {item.time}</Text></View>
        <View style={styles.metaPill}><Text style={styles.metaText}>🩺 {item.role}</Text></View>
        <View style={styles.metaPill}><Text style={styles.metaText}>{item.duration}</Text></View>
      </View>

      <TouchableOpacity style={[styles.applyBtn, styles.applyBtnFull]} activeOpacity={0.85}>
        <Text style={styles.applyBtnText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DashboardScreen({ navigation }: Props) {
  const [activeRole, setActiveRole] = useState('Doctor');

  return (
    <Screen style={styles.container}>
      {/* Role Switcher — segmented control, icon only */}
      <View style={styles.segmentedWrap}>
        <View style={styles.segmented}>
          {ROLES.map(({ label, icon }) => {
            const active = activeRole === label;
            return (
              <TouchableOpacity
                key={label}
                onPress={() => setActiveRole(label)}
                style={[styles.seg, active && styles.segActive]}
                activeOpacity={0.8}
              >
                <Text style={styles.segIcon}>{icon}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.avatarRow}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarInitial}>MP</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.userName}>Meena Pawar</Text>
            </View>
          </View>
          <View style={styles.bellWrap}>
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8} onPress={() => navigation.navigate('Notifications')}>
              <Text style={styles.bellIcon}>🔔</Text>
            </TouchableOpacity>
            <View style={styles.bellPing} />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Urgent Shifts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Urgent Shifts Near You</Text>
          <TouchableOpacity><Text style={styles.sectionLink}>See all</Text></TouchableOpacity>
        </View>

        <FlatList
          data={URGENT_SHIFTS}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.urgentList}
          renderItem={({ item }) => <UrgentShiftCard item={item} />}
          nestedScrollEnabled
        />

        {/* Recommended Shifts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <TouchableOpacity><Text style={styles.sectionLink}>See all</Text></TouchableOpacity>
        </View>

        {RECOMMENDED_SHIFTS.map((item) => (
          <RecommendedShiftCard key={item.id} item={item} />
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },

  // Segmented role switcher — sky bg, white active pill
  segmentedWrap: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#EAF2F8', // --sky
    borderRadius: 10,
    padding: 3,
  },
  seg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  segIcon: { fontSize: 17 },

  // Header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAF2F8', // --sky
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarInitial: { fontSize: 14, fontWeight: '800', color: '#0F3D5C' },
  greeting: { fontSize: 11, color: '#5C6B7A' },
  userName: { fontSize: 14.5, fontWeight: '800', color: '#14202E' },
  bellWrap: { position: 'relative' },
  bellBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: { fontSize: 14 },
  bellPing: {
    position: 'absolute',
    top: 5,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#C0392B', // --urgent
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  // Stats 2x2 grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 18,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    borderRadius: 12,
    padding: 13,
  },
  statValue: { fontSize: 19, fontWeight: '800', color: '#0B2D45' },
  statLabel: { fontSize: 10.8, color: '#5C6B7A', marginTop: 2 },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#14202E' },
  sectionLink: { fontSize: 11, color: '#175E86', fontWeight: '700' },

  // Hospital logo chip (in cards)
  hospitalAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    flexShrink: 0,
    backgroundColor: '#EAF2F8'
  },
  hospitalAvatarText: { fontSize: 12, fontWeight: '800', color: '#0F3D5C' },

  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTopInfo: { flex: 1 },

  // Urgent horizontal cards
  urgentList: { paddingHorizontal: 18, paddingBottom: 6, gap: 10 },
  urgentCard: {
    width: 210,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    borderRadius: 12,
    padding: 13,
  },

  // Tag pills (Urgent, Night, Weekend)
  tagBadge: {
    backgroundColor: '#EAF2F8', // --sky
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagBadgeText: { fontSize: 10, fontWeight: '700', color: '#175E86' },

  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  // Recommended vertical cards
  recCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    borderRadius: 12,
    padding: 13,
    marginHorizontal: 18,
    marginBottom: 10,
  },

  applyBtn: {
    backgroundColor: '#0F3D5C',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  applyBtnFull: { alignSelf: 'flex-end', marginTop: 10 },
  applyBtnText: { fontSize: 11.5, fontWeight: '700', color: '#fff' },

  // Shared card text
  hospitalName: { fontSize: 12.8, fontWeight: '700', color: '#14202E', marginBottom: 1 },
  hospitalLoc: { fontSize: 11, color: '#5C6B7A', marginTop: 1 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaPill: {
    backgroundColor: '#F5F8FA', // --paper
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  metaText: { fontSize: 10.8, color: '#5C6B7A' },
  shiftPay: { fontSize: 13.5, fontWeight: '800', color: '#0B2D45' },
});
