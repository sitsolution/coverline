import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Screen from '../../components/ui/Screen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import BackButton from '../../components/ui/BackButton';
import authService from '../../services/authService';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'> };

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      // API always returns success for security — treat errors the same way
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.heading}>Reset your password</Text>
        <Text style={styles.description}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              ✓ Reset link sent! Check your inbox.
            </Text>
          </View>
        ) : (
          <>
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              title="Send Reset Link"
              onPress={handleSend}
              loading={loading}
              disabled={!email}
              style={styles.btn}
            />
          </>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backLink}>
          <Text style={styles.backLinkText}>Back to Login</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  header: { paddingTop: 14, paddingHorizontal: 18, paddingBottom: 8 },
  body: { flex: 1, paddingHorizontal: 18, paddingTop: 20 },
  heading: { fontSize: 19, fontWeight: '800', color: '#14202E', marginBottom: 12 },
  description: { fontSize: 12, color: '#5C6B7A', lineHeight: 22, marginBottom: 32 },
  btn: { marginBottom: 16 },
  successBox: { backgroundColor: '#ECFDF5', borderRadius: 10, padding: 16, marginBottom: 24 },
  successText: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  backLink: { alignItems: 'center', marginTop: 18 },
  backLinkText: { fontSize: 11.5, color: '#175E86', fontWeight: '600', textAlign: 'center' },
});
