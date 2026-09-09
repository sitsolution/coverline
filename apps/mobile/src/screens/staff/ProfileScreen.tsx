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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';
import userService, { ProfileOut } from '../../services/userService';
import { useFocusEffect } from '@react-navigation/native';

type Props = { navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'> };

function InfoRow({ icon, title, sub, isLast }: { icon: string; title: string; sub: string; isLast?: boolean }) {
  return (
    <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
      <View style={styles.infoAvatar}><Text style={styles.infoAvatarText}>{icon}</Text></View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        {sub ? <Text style={styles.infoSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function roleLabel(role: string): string {
  switch (role) {
    case 'doctor': return 'Doctor';
    case 'nurse': return 'Nurse';
    case 'ot_tech': return 'OT Technician';
    case 'housekeeping': return 'Housekeeping Staff';
    default: return role;
  }
}

export default function ProfileScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<ProfileOut | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await userService.getMe();
      setProfile(data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const { refreshing, onRefresh } = useRefresh(load);

  if (loading) {
    return (
      <Screen style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0F3D5C" />
        </View>
      </Screen>
    );
  }

  const user = profile?.user;
  const p = profile?.profile;

  return (
    <Screen style={styles.container}>
      <View style={styles.appbar}>
        <Text style={styles.appbarTitle}>Profile</Text>
        <View style={styles.spacer} />
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.iconBtnText}>✎</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F3D5C" colors={['#0F3D5C']} />}>
        <View style={styles.profileCenter}>
          <View style={styles.avatarLg}>
            <Text style={styles.avatarLgText}>{user ? getInitials(user.fullName) : '?'}</Text>
          </View>
          <Text style={styles.profileName}>{user?.fullName ?? ''}</Text>
          <Text style={styles.profileTitle}>{p?.specialty ?? roleLabel(user?.role ?? '')}</Text>
          {profile?.location ? (
            <Text style={styles.profileLoc}>📍 {profile.location}</Text>
          ) : p?.preferredLocations && p.preferredLocations.length > 0 ? (
            <Text style={styles.profileLoc}>📍 {p.preferredLocations[0]}</Text>
          ) : null}
          {p && p.rating > 0 && (
            <View style={styles.goldBadge}>
              <Text style={styles.goldBadgeText}>{p.rating.toFixed(1)} ★ · {p.reviewsCount} reviews</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.rowList}>
          {user?.email ? <InfoRow icon="✉" title={user.email} sub="Email" /> : null}
          {user?.phone ? <InfoRow icon="📱" title={user.phone} sub="Phone" isLast /> : <InfoRow icon="📱" title="Not added" sub="Phone" isLast />}
        </View>

        {p && (
          <>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            <View style={styles.rowList}>
              {p.credentialNumber ? <InfoRow icon="🪪" title={p.credentialNumber} sub={p.credentialLabel} /> : null}
              {p.experience ? <InfoRow icon="📆" title={p.experience} sub="Experience" /> : null}
              {p.qualifications ? <InfoRow icon="🎓" title={p.qualifications} sub="Qualifications" isLast /> : null}
            </View>

            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.rowList}>
              {p.preferredLocations.length > 0 && (
                <InfoRow icon="📍" title={p.preferredLocations.join(', ')} sub="Preferred locations" />
              )}
              {p.minPayRate != null && (
                <InfoRow icon="💰" title={`₹${p.minPayRate.toLocaleString('en-IN')} / shift`} sub="Minimum pay rate" isLast />
              )}
            </View>

            {p.bankName && (
              <>
                <Text style={styles.sectionTitle}>Bank Details</Text>
                <View style={styles.rowList}>
                  <InfoRow icon="🏦" title={`${p.bankName}${p.bankAccountLast4 ? ` ····${p.bankAccountLast4}` : ''}`} sub="For payments" isLast />
                </View>
              </>
            )}
          </>
        )}

        <TouchableOpacity style={styles.earningsBtn} onPress={() => navigation.navigate('Earnings')} activeOpacity={0.85}>
          <Text style={styles.earningsBtnText}>💰  My Earnings & Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')} activeOpacity={0.85}>
          <Text style={styles.settingsBtnText}>⚙️  Settings</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingTop: 6, paddingBottom: 14 },
  appbarTitle: { fontSize: 16.5, fontWeight: '800', color: '#14202E' },
  spacer: { flex: 1 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#DCE4EA', alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 14, color: '#0F3D5C' },
  body: { paddingHorizontal: 18, paddingBottom: 20 },
  profileCenter: { alignItems: 'center', paddingTop: 2, paddingBottom: 18 },
  avatarLg: { width: 72, height: 72, borderRadius: 16, backgroundColor: '#EAF2F8', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarLgText: { fontSize: 22, fontWeight: '800', color: '#0F3D5C' },
  profileName: { fontSize: 15, fontWeight: '800', color: '#14202E' },
  profileTitle: { fontSize: 11.5, color: '#5C6B7A', marginTop: 2 },
  profileLoc: { fontSize: 11.5, color: '#5C6B7A' },
  goldBadge: { marginTop: 6, backgroundColor: '#F6EEDC', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  goldBadgeText: { fontSize: 10.5, fontWeight: '700', color: '#B8862E' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#14202E', marginTop: 18, marginBottom: 10 },
  rowList: {},
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#DCE4EA' },
  infoRowLast: { borderBottomWidth: 0 },
  infoAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EAF2F8', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  infoAvatarText: { fontSize: 14 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 12.5, fontWeight: '700', color: '#14202E' },
  infoSub: { fontSize: 11, color: '#5C6B7A', marginTop: 1 },
  earningsBtn: { backgroundColor: '#0F3D5C', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 18 },
  earningsBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  settingsBtn: { backgroundColor: '#EAF2F8', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  settingsBtnText: { fontSize: 13, fontWeight: '700', color: '#0F3D5C' },
});
