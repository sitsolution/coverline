import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../store/auth';
import authService from '../services/authService';

/**
 * Shown when a facility_admin logs in on the mobile app.
 * The admin panel is a web application — this screen guides them there
 * and lets them log out.
 */
export default function AdminGateScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    await logout();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>🏥</Text>
        </View>

        <Text style={styles.title}>Admin Account Detected</Text>
        <Text style={styles.body}>
          This mobile app is for healthcare staff — doctors, nurses, OT technicians, and housekeeping.
        </Text>
        <Text style={styles.body}>
          As a facility admin, please use the{' '}
          <Text style={styles.highlight}>Coverline Web Admin Panel</Text>{' '}
          to manage shifts, staff, and your facility.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoRow}>🌐  Open your browser</Text>
          <Text style={styles.infoRow}>🔑  Log in with your admin credentials</Text>
          <Text style={styles.infoRow}>📋  Manage shifts & staff from the dashboard</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F8FA' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#EAF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: { fontSize: 32 },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#14202E',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 13,
    color: '#5C6B7A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  highlight: {
    fontWeight: '700',
    color: '#175E86',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 28,
    gap: 10,
  },
  infoRow: {
    fontSize: 12.5,
    color: '#14202E',
    fontWeight: '600',
  },
  logoutBtn: {
    width: '100%',
    backgroundColor: '#FBE7E4',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  logoutBtnText: { fontSize: 13, fontWeight: '700', color: '#C0392B' },
});
