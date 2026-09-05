import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator,
} from 'react-native';
import Screen from '../../components/ui/Screen';
import Toast from '../../components/ui/Toast';
import EmptyState from '../../components/ui/EmptyState';
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
  return `${fmt(start)}–${fmt(end)}`;
}

function ShiftCard({ item, onPress, onApply }: { item: ShiftItem; onPress: () => void; onApply: (id: number) => void }) {
  const applied = item.applicationStatus != null;
  const confirmed = item.applicationStatus === 'confirmed';
  const initials = item.facility?.initials || (item.facility?.name ?? '??').slice(0, 2).toUpperCase();

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.96} onPress={onPress}>
      {/* Hospital row */}
      <View style={styles.hospRow}>
        <View style={styles.initials}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.hospName} numberOfLines={1}>{item.facility?.name}</Text>
          <Text style={styles.hospLoc} numberOfLines={1}>📍 {item.facility?.location}</Text>
        </View>
      </View>

      {/* Meta pills */}
      <View style={styles.pillRow}>
        <View style={styles.pill}><Text style={styles.pillText}>🗓 {formatDate(item.startTime)}</Text></View>
        <View style={styles.pill}><Text style={styles.pillText}>⏰ {formatTime(item.startTime, item.endTime)}</Text></View>
        <View style={styles.pill}><Text style={styles.pillText}>🩺 {item.specialty}</Text></View>
        <View style={styles.pill}><Text style={styles.pillText}>{item.durationHours} hrs</Text></View>
      </View>

      {/* Tags */}
      {(item.isUrgent || item.isNight || item.isWeekend) && (
        <View style={styles.tagsRow}>
          {item.isUrgent  && <View style={styles.tagUrgent}><Text style={styles.tagUrgentText}>Urgent</Text></View>}
          {item.isNight   && <View style={styles.tagNight}><Text style={styles.tagNightText}>Night</Text></View>}
          {item.isWeekend && <View style={styles.tagWeekend}><Text style={styles.tagWeekendText}>Weekend</Text></View>}
        </View>
      )}

      {/* Footer */}
      <View style={styles.cardFoot}>
        <Text style={styles.pay}>₹{item.payRate.toLocaleString('en-IN')}</Text>
        {confirmed ? (
          <View style={styles.badgeConfirmed}><Text style={styles.badgeConfirmedText}>Confirmed ✓</Text></View>
        ) : applied ? (
          <View style={styles.badgeApplied}><Text style={styles.badgeAppliedText}>Applied</Text></View>
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
  const [shifts, setShifts]   = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [toast, setToast]     = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const [locations, setLocations]     = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation]   = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [openDrop, setOpenDrop] = useState<'location' | 'specialty' | null>(null);

  const hasFilters = !!(selectedLocation || selectedSpecialty);

  const load = useCallback(async (s?: string, loc?: string, spec?: string) => {
    setLoading(true);
    try {
      const res = await shiftService.listShifts({
        search: s || undefined,
        location: loc || undefined,
        specialty: spec || undefined,
      });
      setShifts(res.items);
    } catch {
      setToast({ visible: true, message: 'Failed to load shifts.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    shiftService.getFilters().then((f) => {
      setLocations(f.locations);
      setSpecialties(f.specialties);
    }).catch(() => {});
  }, [load]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (searchTimeout) clearTimeout(searchTimeout);
    const t = setTimeout(() => load(text || undefined, selectedLocation, selectedSpecialty), 500);
    setSearchTimeout(t);
  };

  const selectLocation = (val: string) => {
    setSelectedLocation(val);
    setOpenDrop(null);
    load(search, val, selectedSpecialty);
  };

  const selectSpecialty = (val: string) => {
    setSelectedSpecialty(val);
    setOpenDrop(null);
    load(search, selectedLocation, val);
  };

  const clearFilters = () => {
    setSelectedLocation('');
    setSelectedSpecialty('');
    setOpenDrop(null);
    load(search);
  };

  const toggleDrop = (key: 'location' | 'specialty') => {
    setOpenDrop(prev => prev === key ? null : key);
  };

  const dropItems = openDrop === 'location' ? locations : specialties;
  const dropSelected = openDrop === 'location' ? selectedLocation : selectedSpecialty;
  const dropSelect = openDrop === 'location' ? selectLocation : selectSpecialty;

  return (
    <Screen style={styles.screen}>
      {/* Appbar */}
      <View style={styles.appbar}>
        <Text style={styles.appbarTitle}>Available Shifts</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MyApplications')} style={styles.myAppsBtn} activeOpacity={0.8}>
          <Text style={styles.myAppsBtnText}>My Applications</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search by hospital, specialty, location…"
          placeholderTextColor="#A9B8C4"
          value={search}
          onChangeText={handleSearchChange}
        />
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, (selectedLocation || openDrop === 'location') && styles.filterChipActive]}
          onPress={() => toggleDrop('location')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterChipText, (selectedLocation || openDrop === 'location') && styles.filterChipTextActive]}>
            {selectedLocation || 'Location'} ▾
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, (selectedSpecialty || openDrop === 'specialty') && styles.filterChipActive]}
          onPress={() => toggleDrop('specialty')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterChipText, (selectedSpecialty || openDrop === 'specialty') && styles.filterChipTextActive]}>
            {selectedSpecialty || 'Specialty'} ▾
          </Text>
        </TouchableOpacity>

        {hasFilters && (
          <TouchableOpacity style={styles.clearChip} onPress={clearFilters} activeOpacity={0.8}>
            <Text style={styles.clearChipText}>✕ Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tag dropdown panel */}
      {openDrop && (
        <View style={styles.tagPanel}>
          <View style={styles.tagGrid}>
            {['', ...dropItems].map((val) => (
              <TouchableOpacity
                key={val || '__all'}
                style={[styles.tag, dropSelected === val && styles.tagActive]}
                onPress={() => dropSelect(val)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tagText, dropSelected === val && styles.tagTextActive]}>
                  {val || 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Shift list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        onScrollBeginDrag={() => setOpenDrop(null)}
      >
        {loading ? (
          <ActivityIndicator color="#0F3D5C" style={{ marginTop: 40 }} />
        ) : shifts.length === 0 ? (
          <EmptyState
            icon="🩺"
            title={search || hasFilters ? 'No shifts match your filters' : 'No shifts available'}
            subtitle={search || hasFilters ? 'Try different filters or clear them.' : 'Check back soon — new shifts are posted regularly.'}
          />
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

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={() => setToast(t => ({ ...t, visible: false }))} />
    </Screen>
  );

  async function handleApply(shiftId: number) {
    try {
      await shiftService.applyToShift(shiftId);
      setToast({ visible: true, message: 'Application submitted!', type: 'success' });
      load(search, selectedLocation, selectedSpecialty);
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.detail ?? 'Could not apply. Please try again.';
      setToast({ visible: true, message: msg, type: 'error' });
    }
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EEF3F8' },

  appbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12,
  },
  appbarTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#14202E' },
  myAppsBtn: {
    backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10,
    paddingVertical: 5, borderWidth: 1, borderColor: '#DCE4EA',
  },
  myAppsBtnText: { fontSize: 11, fontWeight: '700', color: '#175E86' },

  searchWrap: { paddingHorizontal: 18, marginBottom: 10 },
  searchInput: {
    backgroundColor: '#fff', borderWidth: 1.4, borderColor: '#DCE4EA',
    borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11,
    fontSize: 13, color: '#14202E',
  },

  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 8, marginBottom: 4 },
  filterChip: {
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1.4, borderColor: '#DCE4EA',
  },
  filterChipActive: { backgroundColor: '#0F3D5C', borderColor: '#0F3D5C' },
  filterChipText: { fontSize: 12.5, fontWeight: '600', color: '#5C6B7A' },
  filterChipTextActive: { color: '#fff' },
  clearChip: { backgroundColor: '#FDECEA', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  clearChipText: { fontSize: 12.5, fontWeight: '700', color: '#C0392B' },

  // Tag panel — wrapping grid of tags
  tagPanel: {
    backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: '#E2EAF0', paddingHorizontal: 18, paddingVertical: 12, marginBottom: 4,
  },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    borderWidth: 1.4, borderColor: '#DCE4EA', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#F5F8FA',
  },
  tagActive: { backgroundColor: '#0F3D5C', borderColor: '#0F3D5C' },
  tagText: { fontSize: 12.5, fontWeight: '600', color: '#5C6B7A' },
  tagTextActive: { color: '#fff' },

  list: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 24 },

  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#E2EAF0',
    shadowColor: '#0F3D5C', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  hospRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  initials: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#EEF3F8',
    alignItems: 'center', justifyContent: 'center',
  },
  initialsText: { fontSize: 13, fontWeight: '800', color: '#0F3D5C' },
  hospName: { fontSize: 14, fontWeight: '700', color: '#14202E', marginBottom: 2 },
  hospLoc: { fontSize: 11.5, color: '#5C6B7A' },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  pill: { backgroundColor: '#F0F5F9', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 4 },
  pillText: { fontSize: 11.5, color: '#5C6B7A', fontWeight: '500' },

  tagsRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  tagUrgent: { backgroundColor: '#FEF0EE', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 4 },
  tagUrgentText: { fontSize: 11.5, fontWeight: '700', color: '#C0392B' },
  tagNight: { backgroundColor: '#EEF0FE', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 4 },
  tagNightText: { fontSize: 11.5, fontWeight: '700', color: '#3B5BDB' },
  tagWeekend: { backgroundColor: '#F0FEF4', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 4 },
  tagWeekendText: { fontSize: 11.5, fontWeight: '700', color: '#1F8A5F' },

  cardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  pay: { fontSize: 16, fontWeight: '800', color: '#0B2D45' },
  applyBtn: { backgroundColor: '#0F3D5C', borderRadius: 10, paddingHorizontal: 22, paddingVertical: 9 },
  applyBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  badgeApplied: { backgroundColor: '#FBF0E0', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  badgeAppliedText: { fontSize: 12, fontWeight: '700', color: '#C97A2B' },
  badgeConfirmed: { backgroundColor: '#E3F5EC', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  badgeConfirmedText: { fontSize: 12, fontWeight: '700', color: '#1F8A5F' },
});
