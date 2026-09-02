import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // TODO: call API
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
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
          style={styles.socialBtn}
        />
        <Button
          title="Continue with Apple"
          onPress={() => {}}
          variant="outline"
          style={styles.socialBtn}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  body: { padding: 28, paddingTop: 60 },
  heading: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', marginBottom: 8 },
  subtitle: { fontSize: 12, color: '#5C6B7A', marginBottom: 32 },
  forgotRow: { alignItems: 'flex-end', marginTop: -8, marginBottom: 24 },
  forgotText: { fontSize: 11.5, color: '#175E86', fontWeight: '600' },
  loginBtn: { marginBottom: 24 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#DCE4EA' },
  dividerText: { marginHorizontal: 12, fontSize: 12, color: '#5C6B7A', fontWeight: '600' },
  socialBtn: { marginBottom: 12 },
  signupLink: { alignItems: 'center', marginTop: 16 },
  signupLinkText: { fontSize: 11.5, color: '#5C6B7A' },
  link: { color: '#175E86', fontWeight: '600' },
});
