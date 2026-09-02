import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import Button from '../../components/ui/Button';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'OTPVerification'>;
  route: RouteProp<AuthStackParamList, 'OTPVerification'>;
};

export default function OTPVerificationScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (val: string, index: number) => {
    if (!/^\d?$/.test(val)) return;
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);
    if (val && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    setLoading(true);
    // TODO: call API
    setTimeout(() => setLoading(false), 1000);
  };

  const otpFilled = otp.every((d) => d !== '');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.heading}>Verify your account</Text>
        <Text style={styles.description}>
          {'Enter the 6-digit code sent to '}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(r) => { inputs.current[i] = r; }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(v) => handleChange(v, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Button
          title="Verify"
          onPress={handleVerify}
          loading={loading}
          disabled={!otpFilled}
          style={styles.btn}
        />

        <View style={styles.resendRow}>
          {timer > 0 ? (
            <Text style={styles.timerText}>
              {'Resend available in '}
              <Text style={styles.timerBold}>0:{timer.toString().padStart(2, '0')}</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={() => setTimer(59)}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  header: {
    paddingTop: 6,
    paddingHorizontal: 18,
    paddingBottom: 14,
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
  },
  backArrow: { fontSize: 16, color: '#0F3D5C', lineHeight: 18 },
  body: { flex: 1, padding: 28, paddingTop: 20 },
  heading: { fontSize: 24, fontWeight: '800', color: '#1A1A2E', marginBottom: 12 },
  description: { fontSize: 12, color: '#5C6B7A', lineHeight: 22, marginBottom: 36 },
  emailHighlight: { color: '#0F3D5C', fontWeight: '700' },
  otpRow: { flexDirection: 'row', gap: 8, marginBottom: 36 },
  otpBox: {
    width: 42,
    height: 50,
    borderWidth: 1.6,
    borderColor: '#DCE4EA',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#0B2D45',
    backgroundColor: '#F9FAFB',
  },
  otpBoxFilled: { borderColor: '#0F3D5C', backgroundColor: '#EAF2F8' },
  btn: { marginBottom: 24 },
  resendRow: { alignItems: 'center' },
  timerText: { fontSize: 11.5, color: '#5C6B7A' },
  timerBold: { fontSize: 11.5, color: '#14202E', fontWeight: '700' },
  resendLink: { fontSize: 11.5, color: '#175E86', fontWeight: '700' },
});
