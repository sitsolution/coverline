import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Splash'> };

export default function SplashScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <View style={styles.center}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>〜</Text>
          </View>
          <Text style={styles.title}>Locum Ops</Text>
          <Text style={styles.tagline}>
            Streamline locum doctor management —{'\n'}find shifts, get verified, get paid.
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupBtn}
            onPress={() => navigation.navigate('SelectRole')}
            activeOpacity={0.85}
          >
            <Text style={styles.signupBtnText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F3D5C' },
  inner: { flex: 1, paddingHorizontal: 28 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoIcon: { fontSize: 36, color: '#fff' },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 13,
    color: '#BFD6E5',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: { paddingBottom: 40, gap: 12 },
  loginBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: { fontSize: 15, fontWeight: '700', color: '#0B2D45' },
  signupBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
