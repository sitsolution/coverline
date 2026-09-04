import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Screen from '../../components/ui/Screen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ShiftsStackParamList } from '../../navigation/ShiftsStackNavigator';
import shiftService from '../../services/shiftService';
import { ShiftItem } from '../../services/userService';

type Props = { navigation: NativeStackNavigationProp<ShiftsStackParamList, 'ShiftsList'> };

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatTime(start: string, end: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${fmt(start)} – ${fmt(end)}`;
}

function ShiftCard({
  item,
  onPress,
  onApply,
}: {
  item: ShiftItem;
  onPress: () => void;
  onApply: (id: number) => void;
}) {
  const tags: string[] = [];
  if (item.isUrgent) tags.push('Urgent');
  if (item.isNight) tags.push('Night');
  if (item.isWeekend) tags.push('Weekend');

  const applied = item.applicationStatus != null;
  const confirmed = item.applicationStatus === 'confirmed';

  return (
    <TouchableOpacity style={styles.shiftCard} activeOpacity={0.97} onPress={onPress}>
      <View style={styles.cardRow1}>
        <View style={styles.logoChip}>
          <Text style={styles.logoChipText}>{item.facilityInitials || item.facilityName.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.hospInfo}>
          <Text style={styles.hname}>{item.facilityName}</Text>
          <Text style={styles.hloc}>📍 {item.city}{item.area ? `, ${item.area}` : ''}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}><Text style={styles.metaText}>🗓 {formatDate(item.startTime)}</Text></View>
        <View style={styles.metaPill}><Text style={styles.metaText}>⏰ {formatTime(item.startTime, item.endTime)}</Text></View>
        <View style={styles.metaPill}><Text style={styles.metaText}>🩺 {item.specialty}</Text></View>
        <View style={styles.metaPill}><Text style={styles.metaText}>{item.durationHours} hrs</Text></View>
      </View>

      {tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.cardFoot}>
        <Text style={styles.pay}>₹{item.payRate.toLocaleString('en-IN')}</Text>
        {confirmed ? (
          <View style={styles.badgeSuccess}><Text style={styles.badgeSuccessText}>Confirmed</Text></View>
        ) : applied ? (
          <View style={styles.badgeWarning}><Text style={styles.badgeWarningText}>Applied</Text></View>
        ) : (
          <TouchableOpacity style={styles.applyBtn} onPress={() => onApply(item.id)} activeOpacity={0.85}>
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ShiftsScreen({ navigation }: Props) {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const loadShifts = useCallback(async (searchTerm?: string) => {
    setLoading(true);
    try {
      const res = await shiftService.listShifts(searchTerm ? { search: searchTerm } : undefined);
      setShifts(res.items);
    } catch {
      Alert.alert('Error', 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadShifts(); }, [loadShifts]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (searchTimeout) clearTimeout(searchTimeout);
    const t = setTimeout(() => loadShifts(text || undefined), 500);
    setSearchTimeout(t);
  };

  const handleApply = async (shiftId: number) => {
    try {
      await shiftService.applyToShift(shiftId);
      Alert.alert('Success', 'Application submitted!');
      loadShifts(search || undefined);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Could not apply. Please try again.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <Screen style={styles.container}>
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
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search by location, specialty, hospital..."
          placeholderTextColor="#A9B8C4"
          value={search}
          onChangeText={handleSearchChange}
        />

        {loading ? (
          <ActivityIndicator color="#0F3D5C" style={{ marginTop: 40 }} />
        ) : shifts.length === 0 ? (
          <Text style={styles.emptyText}>No shifts found</Text>
        ) : (
          shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              item={shift}
              onPress={() => navigation.navigate('ShiftDetails', { shiftId: shift.id })}
              onApply={handleApply}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  appbar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 18, paddingTop: 6, paddingBottom: 14, backgroundColor: '#F5F8FA',
  },
  appbarTitle: { fontSize: 16.5, fontWeight: '800', color: '#14202E' },
  spacer: { flex: 1 },
  myAppsBtn: { backgroundColor: '#EAF2F8', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  myAppsBtnText: { fontSize: 11, fontWeight: '700', color: '#175E86' },
  body: { paddingHorizontal: 18, paddingBottom: 20 },
  searchInput: {
    backgroundColor: '#fff', borderWidth: 1.4, borderColor: '#DCE4EA',
    borderRadius: 9, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 12.5, color: '#14202E', marginBottom: 10,
  },
  emptyText: { fontSize: 12, color: '#8697A6', textAlign: 'center', marginTop: 40 },
  shiftCard: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#DCE4EA',
    borderRadius: 12, padding: 13, marginBottom: 10,
  },
  cardRow1: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logoChip: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EAF2F8', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  logoChipText: { fontSize: 11, fontWeight: '800', color: '#0F3D5C' },
  hospInfo: { flex: 1 },
  hname: { fontSize: 12.8, fontWeight: '700', color: '#14202E' },
  hloc: { fontSize: 11, color: '#5C6B7A', marginTop: 1 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  metaPill: { backgroundColor: '#F5F8FA', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  metaText: { fontSize: 10.8, color: '#5C6B7A' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  tag: { backgroundColor: '#EAF2F8', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 10, fontWeight: '700', color: '#175E86' },
  cardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  pay: { fontSize: 13.5, fontWeight: '800', color: '#0B2D45' },
  applyBtn: { backgroundColor: '#0F3D5C', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 7 },
  applyBtnText: { fontSize: 11.5, fontWeight: '700', color: '#fff' },
  badgeWarning: { backgroundColor: '#FBECDC', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  badgeWarningText: { fontSize: 11, fontWeight: '700', color: '#C97A2B' },
  badgeSuccess: { backgroundColor: '#E3F5EC', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  badgeSuccessText: { fontSize: 11, fontWeight: '700', color: '#1F8A5F' },
});
