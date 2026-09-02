import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import Button from '../../components/ui/Button';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'SelectRole'> };
type Role = 'doctor' | 'admin' | null;

export default function SelectRoleScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<Role>(null);

  const handleContinue = () => {
    if (selected === 'doctor') navigation.navigate('SignUpDoctor');
    else if (selected === 'admin') navigation.navigate('SignUpAdmin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Your Account</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.subtitle}>Choose how you'll use Locum Ops</Text>

        <TouchableOpacity
          style={[styles.card, selected === 'doctor' && styles.cardSelected]}
          onPress={() => setSelected('doctor')}
          activeOpacity={0.8}
        >
          <View style={styles.cardIcon}>
            <Text style={styles.cardEmoji}>🩺</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>I'm a Locum Doctor</Text>
            <Text style={styles.cardDesc}>Find shifts, manage documents, get paid</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, selected === 'admin' && styles.cardSelected]}
          onPress={() => setSelected('admin')}
          activeOpacity={0.8}
        >
          <View style={styles.cardIcon}>
            <Text style={styles.cardEmoji}>🏥</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>I'm a Hospital/Clinic Admin</Text>
            <Text style={styles.cardDesc}>Post shifts, manage locum doctors</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: '#F5F8FA',
  },
  backBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backArrow: { fontSize: 16, color: '#0F3D5C', lineHeight: 18 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  body: { flex: 1, padding: 24 },
  subtitle: { fontSize: 12, color: '#5C6B7A', marginBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DCE4EA',
    padding: 16,
    marginBottom: 16,
  },
  cardSelected: {
    borderColor: '#0F3D5C',
    borderWidth: 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardEmoji: { fontSize: 26 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 13.5, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  cardDesc: { fontSize: 11.5, color: '#5C6B7A', lineHeight: 18 },
  footer: { padding: 24, paddingTop: 0 },
});
