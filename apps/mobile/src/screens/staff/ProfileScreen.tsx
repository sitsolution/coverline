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
import { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;
};

// ─── Role data ────────────────────────────────────────────────────────────────

const ROLES = [
  { key: 'doctor',  icon: '🩺', initials: 'AR', name: 'Dr. Ananya Rao',    title: 'Emergency Medicine',  email: 'ananya.rao@email.com',        phone: '+91 98xxxxxx21', licenseLabel: 'Medical License', licenseVal: 'MCI-2019-88213',       qual: 'MBBS, MD (Emergency Medicine)', loc: 'Pune, Mumbai',  pay: '₹9,500' },
  { key: 'nurse',   icon: '💉', initials: 'SK', name: 'Sneha Kulkarni, RN', title: 'ICU Nursing',         email: 'sneha.kulkarni@email.com',     phone: '+91 97xxxxxx34', licenseLabel: 'Nursing Council Reg.', licenseVal: 'NCR-2020-45231',   qual: 'B.Sc Nursing',                  loc: 'Pune',          pay: '₹6,000' },
  { key: 'ot',      icon: '🛠️', initials: 'VN', name: 'Vikram Nair',        title: 'OT Technician',       email: 'vikram.nair@email.com',        phone: '+91 96xxxxxx78', licenseLabel: 'OT Cert. No.',         licenseVal: 'OT-2021-78912',    qual: 'Diploma OT Technology',         loc: 'Pune, Mumbai',  pay: '₹5,500' },
  { key: 'hk',      icon: '🧹', initials: 'MP', name: 'Meena Pawar',        title: 'Housekeeping Staff',  email: 'meena.pawar@email.com',        phone: '+91 95xxxxxx56', licenseLabel: 'Employee ID',          licenseVal: 'EMP-2022-34501',   qual: 'Secondary Education',           loc: 'Pune',          pay: '₹3,500' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({
  icon,
  title,
  sub,
  isLast,
}: {
  icon: string;
  title: string;
  sub: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
      <View style={styles.infoAvatar}>
        <Text style={styles.infoAvatarText}>{icon}</Text>
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        {sub ? <Text style={styles.infoSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ProfileScreen({ navigation }: Props) {
  const [activeRoleKey, setActiveRoleKey] = useState('doctor');
  const role = ROLES.find(r => r.key === activeRoleKey) ?? ROLES[0];

  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar */}
      <View style={styles.appbar}>
        <Text style={styles.appbarTitle}>Profile</Text>
        <View style={styles.spacer} />
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.iconBtnText}>✎</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Role Switcher */}
        <View style={styles.segmented}>
          {ROLES.map(({ key, icon }) => {
            const active = activeRoleKey === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveRoleKey(key)}
                style={[styles.seg, active && styles.segActive]}
                activeOpacity={0.8}
              >
                <Text style={styles.segIcon}>{icon}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Avatar + Name */}
        <View style={styles.profileCenter}>
          <View style={styles.avatarLg}>
            <Text style={styles.avatarLgText}>{role.initials}</Text>
          </View>
          <Text style={styles.profileName}>{role.name}</Text>
          <Text style={styles.profileTitle}>{role.title}</Text>
          <Text style={styles.profileLoc}>📍 Pune, Maharashtra</Text>
          <View style={styles.goldBadge}>
            <Text style={styles.goldBadgeText}>4.8 ★ · 24 reviews</Text>
          </View>
        </View>

        {/* Personal Information */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.rowList}>
          <InfoRow icon="✉" title={role.email} sub="Email" />
          <InfoRow icon="📱" title={role.phone} sub="Phone" isLast />
        </View>

        {/* Professional Information */}
        <Text style={styles.sectionTitle}>Professional Information</Text>
        <View style={styles.rowList}>
          <InfoRow icon="🪪" title={role.licenseVal} sub={role.licenseLabel} />
          <InfoRow icon="🎓" title={role.qual} sub="Qualifications" isLast />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.rowList}>
          <InfoRow icon="📍" title={role.loc} sub="Preferred locations" />
          <InfoRow icon="💰" title={`${role.pay} / shift`} sub="Minimum pay rate" isLast />
        </View>

        {/* Bank Details */}
        <Text style={styles.sectionTitle}>Bank Details</Text>
        <View style={styles.rowList}>
          <InfoRow icon="🏦" title="HDFC Bank ····4521" sub="For payments" isLast />
        </View>

        {/* Earnings shortcut */}
        <TouchableOpacity
          style={styles.earningsBtn}
          onPress={() => navigation.navigate('Earnings')}
          activeOpacity={0.85}
        >
          <Text style={styles.earningsBtnText}>💰  My Earnings & Payments</Text>
        </TouchableOpacity>

        {/* Settings shortcut */}
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.85}
        >
          <Text style={styles.settingsBtnText}>⚙️  Settings</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
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
  appbarTitle: { fontSize: 16.5, fontWeight: '800', color: '#14202E' },
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

  // Profile center
  profileCenter: {
    alignItems: 'center',
    paddingTop: 2,
    paddingBottom: 18,
  },
  avatarLg: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#EAF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarLgText: { fontSize: 22, fontWeight: '800', color: '#0F3D5C' },
  profileName: { fontSize: 15, fontWeight: '800', color: '#14202E' },
  profileTitle: { fontSize: 11.5, color: '#5C6B7A', marginTop: 2 },
  profileLoc: { fontSize: 11.5, color: '#5C6B7A' },
  goldBadge: {
    marginTop: 6,
    backgroundColor: '#F6EEDC',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  goldBadgeText: { fontSize: 10.5, fontWeight: '700', color: '#B8862E' },

  // Section title
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#14202E',
    marginTop: 18,
    marginBottom: 10,
  },

  // Row list — no card, rows sit directly on screen bg
  rowList: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE4EA',
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoAvatarText: { fontSize: 14 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 12.5, fontWeight: '700', color: '#14202E' },
  infoSub: { fontSize: 11, color: '#5C6B7A', marginTop: 1 },

  earningsBtn: {
    backgroundColor: '#0F3D5C',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 18,
  },
  earningsBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  settingsBtn: {
    backgroundColor: '#EAF2F8',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 10,
  },
  settingsBtnText: { fontSize: 13, fontWeight: '700', color: '#0F3D5C' },
});
