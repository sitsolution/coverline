import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Screen from '../../components/ui/Screen';
import Toast from '../../components/ui/Toast';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';
import authService from '../../services/authService';

type Props = { navigation: NativeStackNavigationProp<ProfileStackParamList, 'ChangePassword'> };

function PasswordField({
  label,
  value,
  onChangeText,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error ? styles.inputError : null]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          placeholderTextColor="#A9B8C4"
        />
        <TouchableOpacity onPress={() => setVisible(v => !v)} activeOpacity={0.7} style={styles.eyeBtn}>
          <Text style={styles.eyeText}>{visible ? '🙈' : '👁'}</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export default function ChangePasswordScreen({ navigation }: Props) {
  const [current,  setCurrent]  = useState('');
  const [newPass,  setNewPass]  = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!current) e.current = 'Current password is required.';
    if (!newPass) e.newPass = 'New password is required.';
    else if (newPass.length < 8) e.newPass = 'Must be at least 8 characters.';
    else if (newPass === current) e.newPass = 'New password must differ from current.';
    if (!confirm) e.confirm = 'Please confirm your new password.';
    else if (confirm !== newPass) e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    setErrors({});
    try {
      await authService.changePassword(current, newPass);
      setToast({ visible: true, message: 'Password changed successfully.', type: 'success' });
      setTimeout(() => navigation.goBack(), 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Failed to change password.';
      setToast({ visible: true, message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>Change Password</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <Text style={styles.hint}>Choose a strong password with at least 8 characters.</Text>

        <PasswordField label="Current Password"  value={current} onChangeText={v => { setCurrent(v);  setErrors(p => ({ ...p, current: '' })); }} error={errors.current} />
        <PasswordField label="New Password"       value={newPass} onChangeText={v => { setNewPass(v);  setErrors(p => ({ ...p, newPass: '', confirm: '' })); }} error={errors.newPass} />
        <PasswordField label="Confirm New Password" value={confirm} onChangeText={v => { setConfirm(v); setErrors(p => ({ ...p, confirm: '' })); }} error={errors.confirm} />

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.outlineBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSave} activeOpacity={0.85} disabled={saving}>
            <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Update Password'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={() => setToast(t => ({ ...t, visible: false }))} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingTop: 6, paddingBottom: 14 },
  backBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#DCE4EA', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, color: '#0F3D5C', lineHeight: 22 },
  appbarTitle: { fontSize: 16.5, fontWeight: '800', color: '#14202E' },
  spacer: { flex: 1 },
  body: { paddingHorizontal: 18, paddingBottom: 28 },
  hint: { fontSize: 12, color: '#5C6B7A', marginBottom: 20, lineHeight: 17 },
  field: { marginBottom: 14 },
  label: { fontSize: 11.5, fontWeight: '700', color: '#5C6B7A', marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.4, borderColor: '#DCE4EA', borderRadius: 9, backgroundColor: '#fff' },
  inputError: { borderColor: '#C0392B' },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 13, color: '#14202E' },
  eyeBtn: { paddingHorizontal: 12 },
  eyeText: { fontSize: 16 },
  fieldError: { fontSize: 11, color: '#C0392B', marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  outlineBtn: { flex: 1, borderWidth: 1.5, borderColor: '#0F3D5C', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  outlineBtnText: { fontSize: 13, fontWeight: '700', color: '#0F3D5C' },
  primaryBtn: { flex: 1, backgroundColor: '#0F3D5C', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  primaryBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
