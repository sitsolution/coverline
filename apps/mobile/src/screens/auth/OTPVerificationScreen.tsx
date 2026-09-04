import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Screen from '../../components/ui/Screen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import Button from '../../components/ui/Button';
import BackButton from '../../components/ui/BackButton';
import authService from '../../services/authService';
import { useAuth } from '../../store/auth';
import Toast, { ToastType } from '../../components/ui/Toast';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'OTPVerification'>;
  route: RouteProp<AuthStackParamList, 'OTPVerification'>;
};

export default function OTPVerificationScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const { saveTokens } = useAuth();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(59);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' as ToastType });
  const showToast = (message: string, type: ToastType = 'error') =>
    setToast({ visible: true, message, type });

  useEffect(() => {
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

  const handleVerify = async () => {
    setLoading(true);
    try {
      const data = await authService.verifyOtp(email, otp);
      await saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId: data.userId,
        role: data.role,
        isVerified: data.isVerified,
      });
      // RootNavigator will automatically switch to StaffNavigator
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Invalid or expired code. Please try again.';
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendOtp(email);
      setTimer(59);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Could not resend code. Please try again.';
      showToast(msg);
    } finally {
      setResending(false);
    }
  };

  const otpFilled = otp.length === 6;

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.body}>
        <Text style={styles.heading}>Verify your account</Text>
        <Text style={styles.description}>
          {'Enter the 6-digit code sent to '}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.hiddenInput}
          caretHidden
        />

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
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              <Text style={styles.resendLink}>{resending ? 'Sending…' : 'Resend Code'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast(t => ({ ...t, visible: false }))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  header: { paddingTop: 14, paddingHorizontal: 18, paddingBottom: 8 },
  body: { flex: 1, paddingHorizontal: 18, paddingTop: 20 },
  heading: { fontSize: 19, fontWeight: '800', color: '#14202E', marginBottom: 6 },
  description: { fontSize: 12, color: '#5C6B7A', lineHeight: 20 },
  emailHighlight: { color: '#0F3D5C', fontWeight: '700' },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  otpRow: { flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 20 },
  otpBox: {
    width: 42, height: 50, borderWidth: 1.6,
    borderColor: '#DCE4EA', borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
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
