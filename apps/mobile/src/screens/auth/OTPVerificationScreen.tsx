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
import BackButton from '../../components/ui/BackButton';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'OTPVerification'>;
  route: RouteProp<AuthStackParamList, 'OTPVerification'>;
};

export default function OTPVerificationScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(59);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto-focus the hidden input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (val: string) => {
    if (!/^\d*$/.test(val)) return;
    if (val.length <= 6) setOtp(val);
  };

  const handleVerify = () => {
    setLoading(true);
    // TODO: call API
    setTimeout(() => setLoading(false), 1000);
  };

  const otpFilled = otp.length === 6;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.body}>
        <Text style={styles.heading}>Verify your account</Text>
        <Text style={styles.description}>
          {'Enter the 6-digit code sent to '}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        {/* Hidden single input that captures all typing */}
        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.hiddenInput}
          caretHidden
        />

        {/* Visual OTP boxes — tap any to focus the hidden input */}
        <TouchableOpacity
          style={styles.otpRow}
          onPress={() => inputRef.current?.focus()}
          activeOpacity={1}
        >
          {Array(6).fill(0).map((_, i) => (
            <View
              key={i}
              style={[
                styles.otpBox,
                otp[i] ? styles.otpBoxFilled : null,
                otp.length === i && styles.otpBoxActive,
              ]}
            >
              <Text style={styles.otpDigit}>{otp[i] || ''}</Text>
            </View>
          ))}
        </TouchableOpacity>

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
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  body: { flex: 1, paddingHorizontal: 18, paddingTop: 20 },
  heading: { fontSize: 19, fontWeight: '800', color: '#14202E', marginBottom: 6 },
  description: { fontSize: 12, color: '#5C6B7A', lineHeight: 20 },
  emailHighlight: { color: '#0F3D5C', fontWeight: '700' },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  otpRow: { flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 20 },
  otpBox: {
    width: 42,
    height: 50,
    borderWidth: 1.6,
    borderColor: '#DCE4EA',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  otpBoxFilled: { borderColor: '#0F3D5C', backgroundColor: '#EAF2F8' },
  otpBoxActive: { borderColor: '#175E86' },
  otpDigit: { fontSize: 18, fontWeight: '800', color: '#0B2D45' },
  btn: { marginBottom: 24 },
  resendRow: { alignItems: 'center', marginTop: 16 },
  timerText: { fontSize: 11.5, color: '#5C6B7A' },
  timerBold: { fontSize: 11.5, color: '#14202E', fontWeight: '700' },
  resendLink: { fontSize: 11.5, color: '#175E86', fontWeight: '700' },
});
