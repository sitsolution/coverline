import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Screen from '../../components/ui/Screen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import BackButton from '../../components/ui/BackButton';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'SelectRole'> };
type Role = 'doctor' | 'nurse' | 'ot' | 'hk' | 'admin' | null;

const STAFF_ROLES: { key: Role; icon: string; title: string; desc: string }[] = [
  { key: 'doctor', icon: '🩺', title: 'Doctor', desc: 'Find shifts, manage documents, get paid' },
  { key: 'nurse', icon: '💉', title: 'Nurse', desc: 'ICU, ward & OT nursing shifts near you' },
  { key: 'ot', icon: '🛠', title: 'OT Technician', desc: 'Surgical support shifts across facilities' },
  { key: 'hk', icon: '🧹', title: 'Housekeeping Staff', desc: 'Ward, OT & admin-block shifts' },
];

export default function SelectRoleScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<Role>(null);

  const handleContinue = () => {
    if (selected === 'doctor') navigation.navigate('SignUpDoctor');
    else if (selected === 'nurse') navigation.navigate('SignUpNurse');
    else if (selected === 'ot') navigation.navigate('SignUpOTTech');
    else if (selected === 'hk') navigation.navigate('SignUpHousekeeping');
    else if (selected === 'admin') navigation.navigate('SignUpAdmin');
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.appbar}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.appbarTitle}>Create Your Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>I'm looking for shifts as a…</Text>

        {STAFF_ROLES.map((role) => (
          <TouchableOpacity
            key={role.key}
            style={[styles.card, selected === role.key && styles.cardSelected]}
            onPress={() => setSelected(role.key)}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{role.icon}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{role.title}</Text>
              <Text style={styles.cardDesc}>{role.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.separator}>— or —</Text>

        <TouchableOpacity
          style={[styles.card, selected === 'admin' && styles.cardSelected]}
          onPress={() => setSelected('admin')}
          activeOpacity={0.8}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🏥</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>I'm a Hospital/Clinic Admin</Text>
            <Text style={styles.cardDesc}>Post shifts, manage locum staff</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  appbarTitle: { fontSize: 16.5, fontWeight: '800', color: '#14202E' },
  body: { paddingHorizontal: 18, paddingBottom: 24 },
  subtitle: { fontSize: 12, color: '#5C6B7A', marginBottom: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE4EA',
    padding: 14,
    marginBottom: 9,
  },
  cardSelected: {
    borderColor: '#0F3D5C',
    shadowColor: '#EAF2F8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: { fontSize: 20 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#14202E' },
  cardDesc: { fontSize: 11, color: '#5C6B7A', marginTop: 2 },
  separator: {
    textAlign: 'center',
    fontSize: 10.5,
    color: '#8697A6',
    marginTop: 14,
    marginBottom: 10,
  },
  continueBtn: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#0F3D5C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  continueBtnDisabled: { opacity: 0.45 },
  continueBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
