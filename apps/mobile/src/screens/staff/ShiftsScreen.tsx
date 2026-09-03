import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Screen from '../../components/ui/Screen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ShiftsStackParamList } from '../../navigation/ShiftsStackNavigator';

type Props = { navigation: NativeStackNavigationProp<ShiftsStackParamList, 'ShiftsList'> };

// ─── Types ───────────────────────────────────────────────────────────────────

type ShiftState = 'apply' | 'applied' | 'confirmed';

type Shift = {
  id: string;
  initials: string;
  hname: string;
  hloc: string;
  date: string;
  time: string;
  spec: string;
  dur: string;
  pay: string;
  tags: string[];
  state: ShiftState;
};

type Role = {
  icon: string;
  label: string;
  searchPlaceholder: string;
  filters: string[];
  shifts: Shift[];
};

// ─── Data ────────────────────────────────────────────────────────────────────

const ROLES: Record<string, Role> = {
  doctor: {
    icon: '🩺',
    label: 'Doctor',
    searchPlaceholder: '🔍 Search by location, specialty, date',
    filters: ['Location', 'Specialty', 'Date Range', 'Shift Type', 'Pay Rate'],
    shifts: [
      { id: '1', initials: 'AH', hname: 'Apollo Hospital', hloc: 'Kothrud, Pune', date: 'Today', time: '8 PM–8 AM', spec: 'Emergency Med.', dur: '12 hrs', pay: '₹9,500', tags: ['Urgent', 'Night'], state: 'apply' },
      { id: '2', initials: 'SJ', hname: 'St. Joseph Hospital', hloc: 'Kalyani Nagar', date: 'Tomorrow', time: '9 AM–5 PM', spec: 'General Med.', dur: '8 hrs', pay: '₹7,000', tags: ['Urgent'], state: 'applied' },
      { id: '3', initials: 'CV', hname: 'CityCare Clinic', hloc: 'Viman Nagar', date: '12 Sep', time: '9 AM–6 PM', spec: 'Pediatrics', dur: '9 hrs', pay: '₹6,200', tags: ['Weekend'], state: 'apply' },
      { id: '4', initials: 'RM', hname: 'Ruby Medical Centre', hloc: 'Wakad, Pune', date: '14 Sep', time: '8 AM–4 PM', spec: 'Anaesthesia', dur: '8 hrs', pay: '₹8,800', tags: [], state: 'confirmed' },
    ],
  },
  nurse: {
    icon: '💉',
    label: 'Nurse',
    searchPlaceholder: '🔍 Search by location, role, date',
    filters: ['Location', 'Department', 'Date Range', 'Shift Type', 'Pay Rate'],
    shifts: [
      { id: '1', initials: 'AH', hname: 'Apollo Hospital', hloc: 'Kothrud, Pune', date: 'Today', time: '8 PM–8 AM', spec: 'ICU Nursing', dur: '12 hrs', pay: '₹4,200', tags: ['Urgent', 'Night'], state: 'apply' },
      { id: '2', initials: 'SJ', hname: 'St. Joseph Hospital', hloc: 'Kalyani Nagar', date: 'Tomorrow', time: '9 AM–5 PM', spec: 'General Ward', dur: '8 hrs', pay: '₹3,400', tags: ['Urgent'], state: 'applied' },
      { id: '3', initials: 'CV', hname: 'CityCare Clinic', hloc: 'Viman Nagar', date: '12 Sep', time: '9 AM–6 PM', spec: 'OT Nursing', dur: '9 hrs', pay: '₹3,900', tags: ['Weekend'], state: 'apply' },
      { id: '4', initials: 'RM', hname: 'Ruby Medical Centre', hloc: 'Wakad, Pune', date: '14 Sep', time: '8 AM–4 PM', spec: 'Pediatric Nursing', dur: '8 hrs', pay: '₹3,700', tags: [], state: 'confirmed' },
    ],
  },
  ot: {
    icon: '🛠️',
    label: 'OT Tech',
    searchPlaceholder: '🔍 Search by location, role, date',
    filters: ['Location', 'Department', 'Date Range', 'Shift Type', 'Pay Rate'],
    shifts: [
      { id: '1', initials: 'AH', hname: 'Apollo Hospital', hloc: 'Kothrud, Pune', date: 'Today', time: '8 PM–8 AM', spec: 'Cardiac OT', dur: '12 hrs', pay: '₹3,800', tags: ['Urgent', 'Night'], state: 'apply' },
      { id: '2', initials: 'SJ', hname: 'St. Joseph Hospital', hloc: 'Kalyani Nagar', date: 'Tomorrow', time: '9 AM–5 PM', spec: 'General Surgery OT', dur: '8 hrs', pay: '₹3,100', tags: ['Urgent'], state: 'applied' },
      { id: '3', initials: 'RM', hname: 'Ruby Medical Centre', hloc: 'Wakad, Pune', date: '14 Sep', time: '8 AM–4 PM', spec: 'Ortho OT', dur: '8 hrs', pay: '₹3,300', tags: [], state: 'confirmed' },
    ],
  },
  hk: {
    icon: '🧹',
    label: 'Housekeeping',
    searchPlaceholder: '🔍 Search by location, role, date',
    filters: ['Location', 'Department', 'Date Range', 'Shift Type', 'Pay Rate'],
    shifts: [
      { id: '1', initials: 'AH', hname: 'Apollo Hospital', hloc: 'Kothrud, Pune', date: 'Today', time: '8 PM–8 AM', spec: 'OT Housekeeping', dur: '12 hrs', pay: '₹1,600', tags: ['Urgent', 'Night'], state: 'apply' },
      { id: '2', initials: 'SJ', hname: 'St. Joseph Hospital', hloc: 'Kalyani Nagar', date: 'Tomorrow', time: '9 AM–5 PM', spec: 'General Ward', dur: '8 hrs', pay: '₹1,200', tags: ['Urgent'], state: 'applied' },
      { id: '3', initials: 'CV', hname: 'CityCare Clinic', hloc: 'Viman Nagar', date: '12 Sep', time: '9 AM–6 PM', spec: 'Admin Block', dur: '9 hrs', pay: '₹1,350', tags: ['Weekend'], state: 'apply' },
      { id: '4', initials: 'RM', hname: 'Ruby Medical Centre', hloc: 'Wakad, Pune', date: '14 Sep', time: '8 AM–4 PM', spec: 'OT Housekeeping', dur: '8 hrs', pay: '₹1,450', tags: [], state: 'confirmed' },
    ],
  },
};

const ROLE_KEYS = ['doctor', 'nurse', 'ot', 'hk'] as const;

// ─── Shift Card ───────────────────────────────────────────────────────────────

function StateButton({ state, onApply }: { state: ShiftState; onApply: () => void }) {
  if (state === 'applied') {
    return (
      <View style={styles.badgeWarning}>
        <Text style={styles.badgeWarningText}>Applied</Text>
      </View>
    );
  }
  if (state === 'confirmed') {
    return (
      <View style={styles.badgeSuccess}>
        <Text style={styles.badgeSuccessText}>Confirmed</Text>
      </View>
    );
  }
  return (
    <TouchableOpacity style={styles.applyBtn} onPress={onApply} activeOpacity={0.85}>
      <Text style={styles.applyBtnText}>Apply</Text>
    </TouchableOpacity>
  );
}

function ShiftCard({ item, onApply }: { item: Shift; onApply: (id: string) => void }) {
  return (
    <View style={styles.shiftCard}>
      {/* Row 1: logo chip + hospital info */}
      <View style={styles.cardRow1}>
        <View style={styles.logoChip}>
          <Text style={styles.logoChipText}>{item.initials}</Text>
        </View>
        <View style={styles.hospInfo}>
          <Text style={styles.hname}>{item.hname}</Text>
          <Text style={styles.hloc}>📍 {item.hloc}</Text>
        </View>
      </View>

      {/* Meta pills */}
      <View style={styles.metaRow}>
        <View style={styles.metaPill}><Text style={styles.metaText}>🗓 {item.date}</Text></View>
        <View style={styles.metaPill}><Text style={styles.metaText}>⏰ {item.time}</Text></View>
        <View style={styles.metaPill}><Text style={styles.metaText}>🩺 {item.spec}</Text></View>
        <View style={styles.metaPill}><Text style={styles.metaText}>{item.dur}</Text></View>
      </View>

      {/* Tags */}
      {item.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {item.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer: pay + action */}
      <View style={styles.cardFoot}>
        <Text style={styles.pay}>{item.pay}</Text>
        <StateButton state={item.state} onApply={() => onApply(item.id)} />
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ShiftsScreen({ navigation }: Props) {
  const [activeRole, setActiveRole] = useState<typeof ROLE_KEYS[number]>('doctor');
  const [search, setSearch] = useState('');
  const [shiftStates, setShiftStates] = useState<Record<string, ShiftState>>({});

  const role = ROLES[activeRole];

  const handleApply = (id: string) => {
    setShiftStates((prev) => ({ ...prev, [`${activeRole}-${id}`]: 'applied' }));
  };

  const getState = (shift: Shift): ShiftState =>
    shiftStates[`${activeRole}-${shift.id}`] ?? shift.state;

  return (
    <Screen style={styles.container}>
      {/* App Bar */}
      <View style={styles.appbar}>
        <Text style={styles.appbarTitle}>Available Shifts</Text>
        <View style={styles.spacer} />
        <TouchableOpacity
          onPress={() => navigation.navigate('MyApplications')}
          activeOpacity={0.8}
          style={styles.myAppsBtn}
        >
          <Text style={styles.myAppsBtnText}>My Applications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
          <Text style={styles.iconBtnText}>⇅</Text>
        </TouchableOpacity>
      </View>

      {/* Role Switcher */}
      <View style={styles.segmentedWrap}>
        <View style={styles.segmented}>
          {ROLE_KEYS.map((key) => {
            const active = activeRole === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveRole(key)}
                style={[styles.seg, active && styles.segActive]}
                activeOpacity={0.8}
              >
                <Text style={styles.segIcon}>{ROLES[key].icon}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder={role.searchPlaceholder}
          placeholderTextColor="#A9B8C4"
          value={search}
          onChangeText={setSearch}
        />

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {role.filters.map((f) => (
            <TouchableOpacity key={f} style={styles.chipFilter} activeOpacity={0.8}>
              <Text style={styles.chipFilterText}>{f} ▾</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Shift cards */}
        {role.shifts.map((shift) => (
          <TouchableOpacity
            key={shift.id}
            activeOpacity={0.97}
            onPress={() => navigation.navigate('ShiftDetails', {
              initials: shift.initials,
              hname: shift.hname,
              hloc: shift.hloc,
              date: shift.date,
              time: shift.time,
              spec: shift.spec,
              dur: shift.dur,
              pay: shift.pay,
              tags: shift.tags,
              roleIcon: ROLES[activeRole].icon,
              roleLabel: ROLES[activeRole].label,
            })}
          >
          <ShiftCard
            item={{ ...shift, state: getState(shift) }}
            onApply={handleApply}
          />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },

  // App bar
  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
    backgroundColor: '#F5F8FA',
  },
  appbarTitle: { fontSize: 16.5, fontWeight: '800', color: '#14202E' },
  spacer: { flex: 1 },
  myAppsBtn: {
    backgroundColor: '#EAF2F8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  myAppsBtnText: { fontSize: 11, fontWeight: '700', color: '#175E86' },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 14, color: '#0F3D5C', fontWeight: '700' },

  // Role segmented
  segmentedWrap: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: '#F5F8FA',
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#EAF2F8',
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

  // Scroll body
  body: { paddingHorizontal: 18, paddingBottom: 20 },

  // Search
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1.4,
    borderColor: '#DCE4EA',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12.5,
    color: '#14202E',
    marginBottom: 10,
  },

  // Filter chips
  filtersRow: { gap: 7, marginBottom: 14 },
  chipFilter: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  chipFilterText: { fontSize: 11, fontWeight: '600', color: '#5C6B7A' },

  // Shift card
  shiftCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    borderRadius: 12,
    padding: 13,
    marginBottom: 10,
  },
  cardRow1: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
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
  hospInfo: { flex: 1 },
  hname: { fontSize: 12.8, fontWeight: '700', color: '#14202E' },
  hloc: { fontSize: 11, color: '#5C6B7A', marginTop: 1 },

  // Meta pills
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  metaPill: {
    backgroundColor: '#F5F8FA',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  metaText: { fontSize: 10.8, color: '#5C6B7A' },

  // Tags
  tagsRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  tag: {
    backgroundColor: '#EAF2F8',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 10, fontWeight: '700', color: '#175E86' },

  // Card footer
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pay: { fontSize: 13.5, fontWeight: '800', color: '#0B2D45' },

  // State buttons / badges
  applyBtn: {
    backgroundColor: '#0F3D5C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  applyBtnText: { fontSize: 11.5, fontWeight: '700', color: '#fff' },

  badgeWarning: {
    backgroundColor: '#FBECDC',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeWarningText: { fontSize: 10.5, fontWeight: '700', color: '#C97A2B' },

  badgeSuccess: {
    backgroundColor: '#E3F5EC',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeSuccessText: { fontSize: 10.5, fontWeight: '700', color: '#1F8A5F' },
});
