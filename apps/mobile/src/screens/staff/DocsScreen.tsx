import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRefresh } from '../../hooks/useRefresh';
import Screen from '../../components/ui/Screen';
import Toast from '../../components/ui/Toast';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DocsStackParamList } from '../../navigation/DocsStackNavigator';
import documentService, { DocumentGroup } from '../../services/documentService';
import { useFocusEffect } from '@react-navigation/native';

type Props = { navigation: NativeStackNavigationProp<DocsStackParamList, 'DocsList'> };

type BadgeVariant = 'success' | 'warning' | 'urgent' | 'neutral';

function variantFromAPI(v: string): BadgeVariant {
  switch (v) {
    case 'success': return 'success';
    case 'warning': return 'warning';
    case 'urgent': return 'urgent';
    default: return 'neutral';
  }
}

function Badge({ label, variant }: { label: string; variant: BadgeVariant }) {
  const bg = variant === 'success' ? '#E3F5EC' : variant === 'warning' ? '#FBECDC' : variant === 'urgent' ? '#FBE7E4' : '#EAF2F8';
  const color = variant === 'success' ? '#1F8A5F' : variant === 'warning' ? '#C97A2B' : variant === 'urgent' ? '#C0392B' : '#5C6B7A';
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function DocCard({ group }: { group: DocumentGroup }) {
  const variant = variantFromAPI(group.statusVariant);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{group.title}</Text>
        <Badge label={group.statusLabel} variant={variant} />
      </View>
      {group.documents.length > 0 && (
        <View style={styles.subList}>
          {group.documents.map((doc, i) => (
            <View key={doc.id} style={[styles.subRow, i === group.documents.length - 1 && styles.subRowLast]}>
              <Text style={styles.subRowLabel}>{doc.originalFilename}</Text>
              <Badge label={doc.status} variant={doc.status === 'verified' ? 'success' : doc.status === 'pending' ? 'warning' : 'urgent'} />
            </View>
          ))}
        </View>
      )}
      {group.statusVariant === 'neutral' && (
        <Text style={styles.cardMeta}>No documents uploaded yet</Text>
      )}
    </View>
  );
}

export default function DocsScreen({ navigation }: Props) {
  const [groups, setGroups] = useState<DocumentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await documentService.listDocuments();
      setGroups(res.groups);
    } catch {
      setToast({ visible: true, message: 'Failed to load documents.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const { refreshing, onRefresh } = useRefresh(load);

  return (
    <Screen style={styles.container}>
      <View style={styles.appbar}>
        <Text style={styles.appbarTitle}>My Documents</Text>
        <View style={styles.spacer} />
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8} onPress={() => navigation.navigate('DocumentUpload')}>
          <Text style={styles.iconBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F3D5C" colors={['#0F3D5C']} />}>
        {loading ? (
          <ActivityIndicator color="#0F3D5C" style={{ marginTop: 40 }} />
        ) : groups.length === 0 ? (
          <Text style={styles.emptyText}>No documents yet. Upload your first document.</Text>
        ) : (
          groups.map((group) => <DocCard key={group.docType} group={group} />)
        )}

        <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.8} onPress={() => navigation.navigate('DocumentUpload')}>
          <Text style={styles.outlineBtnText}>+ Add Other Document</Text>
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
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingTop: 6, paddingBottom: 14 },
  appbarTitle: { fontSize: 16.5, fontWeight: '800', color: '#14202E' },
  spacer: { flex: 1 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#DCE4EA', alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 18, color: '#0F3D5C', fontWeight: '400', lineHeight: 22 },
  body: { paddingHorizontal: 18, paddingBottom: 20 },
  emptyText: { fontSize: 12, color: '#8697A6', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#DCE4EA', borderRadius: 12, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 12.5, fontWeight: '800', color: '#14202E', flex: 1 },
  cardMeta: { fontSize: 11, color: '#5C6B7A' },
  badge: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { fontSize: 10.5, fontWeight: '700' },
  subList: { marginTop: 6 },
  subRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#DCE4EA' },
  subRowLast: { borderBottomWidth: 0 },
  subRowLabel: { fontSize: 11.5, color: '#14202E', flex: 1, marginRight: 8 },
  outlineBtn: { borderWidth: 1.5, borderColor: '#0F3D5C', borderRadius: 10, paddingVertical: 11, alignItems: 'center', marginTop: 4 },
  outlineBtnText: { fontSize: 13, fontWeight: '700', color: '#0F3D5C' },
});
