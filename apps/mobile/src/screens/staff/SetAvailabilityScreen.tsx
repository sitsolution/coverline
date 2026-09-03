import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Screen from '../../components/ui/Screen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CalendarStackParamList } from '../../navigation/CalendarStackNavigator';

type Props = {
  navigation: NativeStackNavigationProp<CalendarStackParamList, 'SetAvailability'>;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type DayState = 'available' | 'off';

const DEFAULT_DAY_STATES: DayState[] = ['available', 'available', 'available', 'available', 'available', 'off', 'off'];

type Toggle = { label: string; sub: string | null; on: boolean };

const DEFAULT_TOGGLES: Toggle[] = [
  { label: 'Available for Urgent Shifts', sub: 'Get notified for last-minute openings', on: true },
  { label: 'Available for Night Shifts',  sub: null,                                   on: true  },
  { label: 'Available for Weekend Shifts', sub: null,                                  on: false },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function DayCard({
  day,
  state,
  onToggle,
}: {
  day: string;
  state: DayState;
  onToggle: (s: DayState) => void;
}) {
  const isAvailable = state === 'available';
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.dayName}>{day}</Text>
        <View style={styles.miniSeg}>
          <TouchableOpacity
            style={[styles.miniSegItem, isAvailable && styles.miniSegActive]}
            onPress={() => onToggle('available')}
            activeOpacity={0.8}
          >
            <Text style={[styles.miniSegText, isAvailable && styles.miniSegTextActive]}>
              Available
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.miniSegItem, !isAvailable && styles.miniSegActive]}
            onPress={() => onToggle('off')}
            activeOpacity={0.8}
          >
            <Text style={[styles.miniSegText, !isAvailable && styles.miniSegTextActive]}>
              Off
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {isAvailable && (
        <Text style={styles.timeText}>9:00 AM – 6:00 PM</Text>
      )}
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
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleLabel}>{item.label}</Text>
        {item.sub ? <Text style={styles.toggleSub}>{item.sub}</Text> : null}
      </View>
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

export default function SetAvailabilityScreen({ navigation }: Props) {
  const [dayStates, setDayStates] = useState<DayState[]>(DEFAULT_DAY_STATES);
  const [toggles, setToggles] = useState<Toggle[]>(DEFAULT_TOGGLES);
  const [saved, setSaved] = useState(false);

  const updateDay = (index: number, state: DayState) => {
    setDayStates(prev => prev.map((s, i) => (i === index ? state : s)));
  };

  const flipToggle = (index: number) => {
    setToggles(prev => prev.map((t, i) => (i === index ? { ...t, on: !t.on } : t)));
  };

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
        {DAYS.map((day, i) => (
          <DayCard
            key={day}
            day={day}
            state={dayStates[i]}
            onToggle={state => updateDay(i, state)}
          />
        ))}

        {/* Shift Preferences */}
        <Text style={styles.sectionTitle}>Shift Preferences</Text>
        <View style={styles.toggleList}>
          {toggles.map((t, i) => (
            <ToggleRow
              key={t.label}
              item={t}
              isLast={i === toggles.length - 1}
              onToggle={() => flipToggle(i)}
            />
          ))}
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.primaryBtn, saved && styles.primaryBtnSaved]}
          onPress={() => setSaved(true)}
          activeOpacity={0.85}
          disabled={saved}
        >
          <Text style={styles.primaryBtnText}>{saved ? 'Saved ✓' : 'Save Availability'}</Text>
        </TouchableOpacity>

        {/* View My Calendar link */}
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.calendarLink}>View My Calendar</Text>
        </TouchableOpacity>
      </ScrollView>
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

  // Toggle list — no card, rows sit directly on screen bg
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
  primaryBtnSaved: { backgroundColor: '#1F8A5F' },
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
