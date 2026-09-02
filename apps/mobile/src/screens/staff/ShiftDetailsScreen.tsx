import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ShiftsStackParamList } from '../../navigation/ShiftsStackNavigator';

type Props = {
  navigation: NativeStackNavigationProp<ShiftsStackParamList, 'ShiftDetails'>;
  route: RouteProp<ShiftsStackParamList, 'ShiftDetails'>;
};

const ROLES = [
  { key: 'doctor', icon: '🩺' },
  { key: 'nurse', icon: '💉' },
  { key: 'ot', icon: '🛠️' },
  { key: 'hk', icon: '🧹' },
];

const REQ_TEXT: Record<string, string> = {
  Doctor: 'BLS certification required. Minimum 2 years ER experience. Valid state medical license.',
  Nurse: 'BLS/ACLS preferred. Minimum 1 year ICU experience. Valid nursing council registration.',
  'OT Tech': 'OT Technician certification required. Minimum 1 year surgical support experience.',
  Housekeeping: 'Prior hospital housekeeping experience preferred. Basic infection-control training required.',
};

const FACILITIES = ['On-call room', 'Meals provided', 'Cab pickup'];

export default function ShiftDetailsScreen({ navigation, route }: Props) {
  const { initials, hname, hloc, date, time, spec, dur, pay, tags, roleIcon, roleLabel } = route.params;
  const [applied, setApplied] = useState(false);
  const [activeRole, setActiveRole] = useState('doctor');

  // Hide bottom tab bar on this screen
  useFocusEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      parent?.setOptions({
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#DCE4EA',
          height: 62,
          paddingBottom: 6,
          paddingTop: 6,
        },
      });
    };
  });

  const reqText = REQ_TEXT[roleLabel] ?? REQ_TEXT['Doctor'];

  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar */}
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
          <Text style={styles.iconBtnText}>♡</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Role Switcher */}
        <View style={styles.segmented}>
          {ROLES.map(({ key, icon }) => {
            const active = activeRole === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveRole(key)}
                style={[styles.seg, active && styles.segActive]}
                activeOpacity={0.8}
              >
                <Text style={styles.segIcon}>{icon}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Hero gradient banner */}
        <LinearGradient
          colors={['#0F3D5C', '#1B6C97']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          {tags.includes('Urgent') && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>Urgent</Text>
            </View>
          )}
        </LinearGradient>

        {/* Hospital info row */}
        <View style={styles.hospRow}>
          <View style={styles.logoChip}>
            <Text style={styles.logoChipText}>{initials}</Text>
          </View>
          <View style={styles.hospInfo}>
            <Text style={styles.hospName}>{hname}</Text>
            <Text style={styles.hospMeta}>📍 {hloc} · 4.6★ facility rating</Text>
          </View>
        </View>

        {/* Shift detail card */}
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🗓 Date &amp; Time</Text>
            <Text style={styles.detailValue}>{date}, {time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📍 Location</Text>
            <TouchableOpacity>
              <Text style={styles.detailValueLink}>View on Map</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{roleIcon} Role Needed</Text>
            <Text style={styles.detailValue}>{roleLabel} · {spec}</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>⏱ Duration</Text>
            <Text style={styles.detailValue}>{dur}</Text>
          </View>
        </View>

        {/* Requirements */}
        <Text style={styles.sectionTitle}>Requirements</Text>
        <Text style={styles.sectionBody}>{reqText}</Text>

        {/* Facilities */}
        <Text style={styles.sectionTitle}>Facilities Available</Text>
        <View style={styles.tagsRow}>
          {FACILITIES.map((f) => (
            <View key={f} style={styles.tag}>
              <Text style={styles.tagText}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Sticky footer — same bg as screen */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPayLabel}>Pay rate</Text>
          <Text style={styles.footerPay}>{pay}</Text>
        </View>
        <TouchableOpacity
          style={[styles.applyBtn, applied && styles.applyBtnApplied]}
          onPress={() => setApplied(true)}
          activeOpacity={0.85}
          disabled={applied}
        >
          <Text style={styles.applyBtnText}>{applied ? 'Applied ✓' : 'Apply for Shift'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
  spacer: { flex: 1 },
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
  iconBtnText: { fontSize: 14, color: '#0F3D5C' },

  body: { paddingHorizontal: 18, paddingBottom: 20 },

  // Role segmented
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

  // Hero banner
  heroBanner: {
    height: 110,
    borderRadius: 12,
    marginBottom: 14,
    justifyContent: 'flex-end',
    padding: 12,
  },
  urgentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FBE7E4',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  urgentBadgeText: { fontSize: 10.5, fontWeight: '700', color: '#C0392B' },

  // Hospital row
  hospRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  logoChip: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EAF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoChipText: { fontSize: 12, fontWeight: '800', color: '#0F3D5C' },
  hospInfo: { flex: 1 },
  hospName: { fontSize: 14.5, fontWeight: '800', color: '#14202E' },
  hospMeta: { fontSize: 11.3, color: '#5C6B7A', marginTop: 1 },

  // Detail card
  detailCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    borderRadius: 12,
    paddingHorizontal: 13,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F7',
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: 12.5, fontWeight: '700', color: '#14202E' },
  detailValue: { fontSize: 12, color: '#5C6B7A' },
  detailValueLink: { fontSize: 12, color: '#175E86', fontWeight: '700' },

  // Sections
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#14202E',
    marginTop: 18,
    marginBottom: 10,
  },
  sectionBody: {
    fontSize: 12,
    color: '#5C6B7A',
    lineHeight: 19,
    marginBottom: 10,
  },

  // Facility tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: '#EAF2F8',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 10, fontWeight: '700', color: '#175E86' },

  // Footer — same bg as screen, no white
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: '#DCE4EA',
    backgroundColor: '#F5F8FA',
  },
  footerPayLabel: { fontSize: 10.5, color: '#5C6B7A' },
  footerPay: { fontSize: 16, fontWeight: '800', color: '#0B2D45' },
  applyBtn: {
    backgroundColor: '#0F3D5C',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  applyBtnApplied: { backgroundColor: '#1F8A5F' },
  applyBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
