import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Screen from '../../components/ui/Screen';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ShiftsStackParamList } from '../../navigation/ShiftsStackNavigator';
import shiftService from '../../services/shiftService';
import { ShiftItem } from '../../services/userService';

type Props = {
  navigation: NativeStackNavigationProp<ShiftsStackParamList, 'ShiftDetails'>;
  route: RouteProp<ShiftsStackParamList, 'ShiftDetails'>;
};

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(start: string, end: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function ShiftDetailsScreen({ navigation, route }: Props) {
  const { shiftId } = route.params;
  const [shift, setShift] = useState<ShiftItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [favorite, setFavorite] = useState(false);

  useFocusEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      parent?.setOptions({
        tabBarStyle: {
          backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#DCE4EA',
          height: 62, paddingBottom: 6, paddingTop: 6,
        },
      });
    };
  });

  const loadShift = useCallback(async () => {
    try {
      const data = await shiftService.getShift(shiftId);
      setShift(data);
      setFavorite(data.isFavorite);
    } catch {
      Alert.alert('Error', 'Failed to load shift details');
    } finally {
      setLoading(false);
    }
  }, [shiftId]);

  useEffect(() => { loadShift(); }, [loadShift]);

  const handleApply = async () => {
    if (!shift) return;
    setApplying(true);
    try {
      await shiftService.applyToShift(shiftId);
      Alert.alert('Success', 'Application submitted!');
      loadShift();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Could not apply. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setApplying(false);
    }
  };

  const toggleFavorite = async () => {
    if (!shift) return;
    try {
      if (favorite) {
        await shiftService.removeFavorite(shiftId);
      } else {
        await shiftService.addFavorite(shiftId);
      }
      setFavorite(!favorite);
    } catch {
      Alert.alert('Error', 'Could not update favorites');
    }
  };

  if (loading) {
    return (
      <Screen style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0F3D5C" />
        </View>
      </Screen>
    );
  }

  if (!shift) {
    return (
      <Screen style={styles.container}>
        <View style={styles.appbar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#5C6B7A' }}>Shift not found</Text>
      </Screen>
    );
  }

  const isApplied = shift.applicationStatus != null;
  const isConfirmed = shift.applicationStatus === 'confirmed';

  return (
    <Screen style={styles.container}>
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity style={styles.iconBtn} onPress={toggleFavorite} activeOpacity={0.8}>
          <Text style={styles.iconBtnText}>{favorite ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <LinearGradient
          colors={['#0F3D5C', '#1B6C97']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          {shift.isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>Urgent</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.hospRow}>
          <View style={styles.logoChip}>
            <Text style={styles.logoChipText}>{shift.facilityInitials || shift.facilityName.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={styles.hospInfo}>
            <Text style={styles.hospName}>{shift.facilityName}</Text>
            <Text style={styles.hospMeta}>📍 {shift.city}{shift.area ? `, ${shift.area}` : ''}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🗓 Date &amp; Time</Text>
            <Text style={styles.detailValue}>{formatDate(shift.startTime)}, {formatTime(shift.startTime, shift.endTime)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🩺 Specialty</Text>
            <Text style={styles.detailValue}>{shift.specialty}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>⏱ Duration</Text>
            <Text style={styles.detailValue}>{shift.durationHours} hrs</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>👥 Slots</Text>
            <Text style={styles.detailValue}>{shift.slotsFilled} / {shift.slots} filled</Text>
          </View>
        </View>

        {shift.isUrgent || shift.isNight || shift.isWeekend ? (
          <>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsRow}>
              {shift.isUrgent && <View style={styles.tag}><Text style={styles.tagText}>Urgent</Text></View>}
              {shift.isNight && <View style={styles.tag}><Text style={styles.tagText}>Night</Text></View>}
              {shift.isWeekend && <View style={styles.tag}><Text style={styles.tagText}>Weekend</Text></View>}
            </View>
          </>
        ) : null}

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPayLabel}>Pay rate</Text>
          <Text style={styles.footerPay}>₹{shift.payRate.toLocaleString('en-IN')}</Text>
        </View>
        {isConfirmed ? (
          <View style={[styles.applyBtn, { backgroundColor: '#1F8A5F' }]}>
            <Text style={styles.applyBtnText}>Confirmed ✓</Text>
          </View>
        ) : isApplied ? (
          <View style={[styles.applyBtn, { backgroundColor: '#8697A6' }]}>
            <Text style={styles.applyBtnText}>Applied ✓</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={handleApply}
            activeOpacity={0.85}
            disabled={applying}
          >
            <Text style={styles.applyBtnText}>{applying ? 'Applying…' : 'Apply for Shift'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingTop: 6, paddingBottom: 14 },
  backBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#DCE4EA', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, color: '#0F3D5C', lineHeight: 22 },
  spacer: { flex: 1 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#DCE4EA', alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 16, color: '#C0392B' },
  body: { paddingHorizontal: 18, paddingBottom: 20 },
  heroBanner: { height: 110, borderRadius: 12, marginBottom: 14, justifyContent: 'flex-end', padding: 12 },
  urgentBadge: { alignSelf: 'flex-start', backgroundColor: '#FBE7E4', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  urgentBadgeText: { fontSize: 10.5, fontWeight: '700', color: '#C0392B' },
  hospRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  logoChip: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#EAF2F8', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoChipText: { fontSize: 12, fontWeight: '800', color: '#0F3D5C' },
  hospInfo: { flex: 1 },
  hospName: { fontSize: 14.5, fontWeight: '800', color: '#14202E' },
  hospMeta: { fontSize: 11.3, color: '#5C6B7A', marginTop: 1 },
  detailCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#DCE4EA', borderRadius: 12, paddingHorizontal: 13, marginBottom: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F0F4F7' },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: 12.5, fontWeight: '700', color: '#14202E' },
  detailValue: { fontSize: 12, color: '#5C6B7A' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#14202E', marginTop: 18, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#EAF2F8', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 10, fontWeight: '700', color: '#175E86' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6, borderTopWidth: 1, borderTopColor: '#DCE4EA', backgroundColor: '#F5F8FA' },
  footerPayLabel: { fontSize: 10.5, color: '#5C6B7A' },
  footerPay: { fontSize: 16, fontWeight: '800', color: '#0B2D45' },
  applyBtn: { backgroundColor: '#0F3D5C', borderRadius: 10, paddingHorizontal: 28, paddingVertical: 12 },
  applyBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
