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
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

type Toggle = { label: string; on: boolean };

const DEFAULT_TOGGLES: Toggle[] = [
  { label: 'Push Notifications', on: true  },
  { label: 'SMS Alerts',         on: true  },
  { label: 'Email Alerts',       on: false },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}

function InfoRow({
  icon,
  title,
  sub,
  isLast,
}: {
  icon: string;
  title: string;
  sub?: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{icon}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>{title}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

function ToggleRow({
  item,
  isLast,
  onToggle,
}: {
  item: Toggle;
  isLast: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={[styles.toggleRow, isLast && styles.toggleRowLast]}>
      <Text style={styles.toggleLabel}>{item.label}</Text>
      <TouchableOpacity
        style={[styles.switchTrack, item.on ? styles.switchOn : styles.switchOff]}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <View style={[styles.switchThumb, item.on ? styles.thumbRight : styles.thumbLeft]} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function SettingsScreen({ navigation }: Props) {
  const [toggles, setToggles] = useState<Toggle[]>(DEFAULT_TOGGLES);

  const flip = (i: number) =>
    setToggles(prev => prev.map((t, idx) => idx === i ? { ...t, on: !t.on } : t));

  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar */}
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>Settings</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>

        {/* Account */}
        <SectionTitle label="Account" />
        <View style={styles.rowList}>
          <InfoRow icon="🔒" title="Change Password" />
          <InfoRow icon="📱" title="Phone Number" sub="+91 98xxxxxx21" />
          <InfoRow icon="✉"  title="Email Preferences" isLast />
        </View>

        {/* Notifications */}
        <SectionTitle label="Notifications" />
        {toggles.map((t, i) => (
          <ToggleRow key={t.label} item={t} isLast={i === toggles.length - 1} onToggle={() => flip(i)} />
        ))}

        {/* Privacy */}
        <SectionTitle label="Privacy" />
        <View style={styles.rowList}>
          <InfoRow icon="👁" title="Profile Visibility" />
          <InfoRow icon="🛡" title="Data & Security" isLast />
        </View>

        {/* Help & Support */}
        <SectionTitle label="Help & Support" />
        <View style={styles.rowList}>
          <TouchableOpacity onPress={() => navigation.navigate('HelpSupport')} activeOpacity={0.7}>
            <InfoRow icon="❓" title="FAQ" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('HelpSupport')} activeOpacity={0.7}>
            <InfoRow icon="💬" title="Contact Support" />
          </TouchableOpacity>
          <InfoRow icon="🐞" title="Report a Bug" isLast />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85}>
          <Text style={styles.logoutBtnText}>Logout</Text>
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

  // Section title
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#14202E',
    marginTop: 18,
    marginBottom: 10,
  },

  // Row list — transparent, no card
  rowList: {},
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
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 12.5, fontWeight: '700', color: '#14202E' },
  rowSub:   { fontSize: 11, color: '#5C6B7A', marginTop: 1 },
  chevron:  { fontSize: 16, color: '#8697A6' },

  // Toggle rows — transparent, no card
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE4EA',
  },
  toggleRowLast: { borderBottomWidth: 0 },
  toggleLabel: { fontSize: 12.5, fontWeight: '600', color: '#14202E' },

  // Switch
  switchTrack: {
    width: 38,
    height: 22,
    borderRadius: 20,
    justifyContent: 'center',
    flexShrink: 0,
  },
  switchOn:  { backgroundColor: '#0F3D5C' },
  switchOff: { backgroundColor: '#DCE4EA' },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    position: 'absolute',
  },
  thumbRight: { right: 2 },
  thumbLeft:  { left: 2 },

  // Logout button
  logoutBtn: {
    backgroundColor: '#FBE7E4',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutBtnText: { fontSize: 13, fontWeight: '700', color: '#C0392B' },
});
