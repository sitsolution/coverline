import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Splash'> };

export default function SplashScreen({ navigation }: Props) {
  return (
    <LinearGradient
      colors={['#0F3D5C', '#0B2D45']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.logoBox}>
            <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
              <Path
                d="M2 12h4l2-7 4 14 2-9 2 5h6"
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={styles.title}>Coverline</Text>
          <Text style={styles.tagline}>
            Cover every shift — doctors, nurses, OT technicians & housekeeping staff, all in one place.
          </Text>

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
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    color: '#BFD6E5',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 50,
  },
  buttons: { width: '100%', gap: 10 },
  loginBtn: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: { fontSize: 13, fontWeight: '700', color: '#0B2D45' },
  signupBtn: {
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
});
