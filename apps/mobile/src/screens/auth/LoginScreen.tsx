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
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import authService from '../../services/authService';
import { useAuth } from '../../store/auth';
import Toast, { ToastType } from '../../components/ui/Toast';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const { saveTokens } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' as ToastType });

  const showToast = (message: string, type: ToastType = 'error') =>
    setToast({ visible: true, message, type });

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      if (!data.isVerified) {
        navigation.navigate('OTPVerification', { email });
      } else {
        await saveTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.userId,
          role: data.role,
          isVerified: data.isVerified,
        });
      }
    } catch (err: unknown) {
      const detail = (err as any)?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((e: any) => e.msg ?? JSON.stringify(e)).join('\n')
        : (typeof detail === 'string' ? detail : 'Login failed. Please try again.');
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subtitle}>Login to manage your shifts</Text>

        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          isPassword
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotRow}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button title="Login" onPress={handleLogin} loading={loading} style={styles.loginBtn} />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          title="Continue with Google"
          onPress={() => {}}
          variant="outline"
          style={styles.googleBtn}
        />
        <Button
          title="Continue with Apple"
          onPress={() => {}}
          variant="outline"
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('SelectRole')}
          style={styles.signupLink}
        >
          <Text style={styles.signupLinkText}>
            Don't have an account?{' '}
            <Text style={styles.link}>Sign Up</Text>
          </Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  body: { paddingHorizontal: 18, paddingTop: 60, paddingBottom: 20 },
  heading: { fontSize: 20, fontWeight: '800', color: '#14202E', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#5C6B7A', marginBottom: 28 },
  forgotRow: { alignItems: 'flex-end', marginTop: -4, marginBottom: 18 },
  forgotText: { fontSize: 11.5, color: '#175E86', fontWeight: '700' },
  loginBtn: { marginBottom: 16 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#DCE4EA' },
  dividerText: { marginHorizontal: 10, fontSize: 10.5, color: '#8697A6', fontWeight: '600' },
  googleBtn: { marginBottom: 10 },
  signupLink: { alignItems: 'center', marginTop: 20 },
  signupLinkText: { fontSize: 11.5, color: '#5C6B7A' },
  link: { color: '#0F3D5C', fontWeight: '700' },
});
