import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Screen from '../../components/ui/Screen';
import Toast from '../../components/ui/Toast';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CalendarStackParamList } from '../../navigation/CalendarStackNavigator';
import availabilityService, {
  AvailabilityDay,
  ShiftPreferencesOut,
} from '../../services/availabilityService';

type Props = {
  navigation: NativeStackNavigationProp<CalendarStackParamList, 'SetAvailability'>;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function DayCard({
  day,
  onToggle,
}: {
  day: AvailabilityDay;
  onToggle: (weekday: number, isAvailable: boolean) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.dayName}>{day.dayName}</Text>
        <View style={styles.miniSeg}>
          <TouchableOpacity
            style={[styles.miniSegItem, day.isAvailable && styles.miniSegActive]}
            onPress={() => onToggle(day.weekday, true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.miniSegText, day.isAvailable && styles.miniSegTextActive]}>
              Available
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.miniSegItem, !day.isAvailable && styles.miniSegActive]}
            onPress={() => onToggle(day.weekday, false)}
            activeOpacity={0.8}
          >
            <Text style={[styles.miniSegText, !day.isAvailable && styles.miniSegTextActive]}>
              Off
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {day.isAvailable && (
        <Text style={styles.timeText}>{day.startTime} – {day.endTime}</Text>
      )}
    </View>
  );
}

function ToggleRow({
  label,
  sub,
  on,
  isLast,
  onToggle,
}: {
  label: string;
  sub: string | null;
  on: boolean;
  isLast: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={[styles.toggleRow, isLast && styles.toggleRowLast]}>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {sub ? <Text style={styles.toggleSub}>{sub}</Text> : null}
      </View>
      <TouchableOpacity
        style={[styles.switchTrack, on ? styles.switchOn : styles.switchOff]}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <View style={[styles.switchThumb, on ? styles.thumbRight : styles.thumbLeft]} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function SetAvailabilityScreen({ navigation }: Props) {
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [prefs, setPrefs] = useState<ShiftPreferencesOut>({ urgentShifts: true, nightShifts: true, weekendShifts: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const load = useCallback(async () => {
    try {
      const res = await availabilityService.getAvailability();
      setDays(res.days);
      setPrefs(res.preferences);
    } catch {
      setToast({ visible: true, message: 'Failed to load availability.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleDay = (weekday: number, isAvailable: boolean) => {
    setDays(prev => prev.map(d => d.weekday === weekday ? { ...d, isAvailable } : d));
  };

  const togglePref = (key: keyof ShiftPreferencesOut) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await availabilityService.updateAvailability({
        days: days.map(d => ({ weekday: d.weekday, isAvailable: d.isAvailable })),
        preferences: prefs,
      });
      setToast({ visible: true, message: 'Availability updated.', type: 'success' });
      navigation.goBack();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to save availability.';
      setToast({ visible: true, message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen style={styles.container}>
        <View style={styles.appbar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.appbarTitle}>Set Your Availability</Text>
          <View style={styles.spacer} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0F3D5C" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      {/* App Bar */}
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>Set Your Availability</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Day cards */}
        {days.map(day => (
          <DayCard key={day.weekday} day={day} onToggle={toggleDay} />
        ))}

        {/* Shift Preferences */}
        <Text style={styles.sectionTitle}>Shift Preferences</Text>
        <View style={styles.toggleList}>
          <ToggleRow
            label="Available for Urgent Shifts"
            sub="Get notified for last-minute openings"
            on={prefs.urgentShifts}
            isLast={false}
            onToggle={() => togglePref('urgentShifts')}
          />
          <ToggleRow
            label="Available for Night Shifts"
            sub={null}
            on={prefs.nightShifts}
            isLast={false}
            onToggle={() => togglePref('nightShifts')}
          />
          <ToggleRow
            label="Available for Weekend Shifts"
            sub={null}
            on={prefs.weekendShifts}
            isLast
            onToggle={() => togglePref('weekendShifts')}
          />
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
        >
          <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save Availability'}</Text>
        </TouchableOpacity>

        {/* View My Calendar link */}
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.calendarLink}>View My Calendar</Text>
        </TouchableOpacity>
      </ScrollView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast(t => ({ ...t, visible: false }))}
      />
    </Screen>
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

  // Day card
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayName: { fontSize: 12.5, fontWeight: '700', color: '#14202E' },

  // Mini segmented control
  miniSeg: {
    flexDirection: 'row',
    backgroundColor: '#EAF2F8',
    borderRadius: 10,
    padding: 3,
    width: 150,
  },
  miniSegItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  miniSegActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  miniSegText: { fontSize: 11.5, fontWeight: '700', color: '#175E86' },
  miniSegTextActive: { color: '#0B2D45' },

  timeText: { fontSize: 11, color: '#5C6B7A', marginTop: 8 },

  // Section title
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#14202E',
    marginTop: 18,
    marginBottom: 10,
  },

  // Toggle list
  toggleList: {},
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE4EA',
  },
  toggleRowLast: { borderBottomWidth: 0 },
  toggleInfo: { flex: 1, marginRight: 12 },
  toggleLabel: { fontSize: 12.5, fontWeight: '600', color: '#14202E' },
  toggleSub: { fontSize: 10.5, color: '#5C6B7A', marginTop: 2 },

  // Switch
  switchTrack: {
    width: 38,
    height: 22,
    borderRadius: 20,
    justifyContent: 'center',
    flexShrink: 0,
  },
  switchOn: { backgroundColor: '#0F3D5C' },
  switchOff: { backgroundColor: '#DCE4EA' },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    position: 'absolute',
  },
  thumbRight: { right: 2 },
  thumbLeft: { left: 2 },

  // Save button
  primaryBtn: {
    backgroundColor: '#0F3D5C',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // Calendar link
  calendarLink: {
    textAlign: 'center',
    fontSize: 11.5,
    fontWeight: '700',
    color: '#175E86',
    marginTop: 14,
  },
});
