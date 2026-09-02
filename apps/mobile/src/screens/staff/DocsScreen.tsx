import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DocsStackParamList } from '../../navigation/DocsStackNavigator';

type Props = {
  navigation: NativeStackNavigationProp<DocsStackParamList, 'DocsList'>;
};

// ─── Types ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'success' | 'warning' | 'urgent';

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ label, variant }: { label: string; variant: BadgeVariant }) {
  const bg =
    variant === 'success' ? '#E3F5EC' :
    variant === 'warning' ? '#FBECDC' : '#FBE7E4';
  const color =
    variant === 'success' ? '#1F8A5F' :
    variant === 'warning' ? '#C97A2B' : '#C0392B';
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function CardHeader({
  title,
  badge,
}: {
  title: string;
  badge: { label: string; variant: BadgeVariant };
}) {
  return (
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Badge label={badge.label} variant={badge.variant} />
    </View>
  );
}

function SubRow({
  label,
  badgeLabel,
  badgeVariant,
  isLast,
}: {
  label: string;
  badgeLabel: string;
  badgeVariant: BadgeVariant;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.subRow, isLast && styles.subRowLast]}>
      <Text style={styles.subRowLabel}>{label}</Text>
      <Badge label={badgeLabel} variant={badgeVariant} />
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function DocsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar */}
      <View style={styles.appbar}>
        <Text style={styles.appbarTitle}>My Documents</Text>
        <View style={styles.spacer} />
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('DocumentUpload')}
        >
          <Text style={styles.iconBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Medical License */}
        <SectionCard>
          <CardHeader title="Medical License" badge={{ label: 'Verified', variant: 'success' }} />
          <Text style={styles.cardMeta}>MCI-2019-88213 · Expires 04 Mar 2027</Text>
        </SectionCard>

        {/* Certifications */}
        <SectionCard>
          <CardHeader title="Certifications" badge={{ label: '1 Pending', variant: 'warning' }} />
          <View style={styles.subList}>
            <SubRow label="BLS Certification.pdf" badgeLabel="Verified" badgeVariant="success" />
            <SubRow label="ACLS Certification.pdf" badgeLabel="Pending" badgeVariant="warning" isLast />
          </View>
        </SectionCard>

        {/* ID Proof */}
        <SectionCard>
          <CardHeader title="ID Proof (Aadhaar)" badge={{ label: 'Verified', variant: 'success' }} />
        </SectionCard>

        {/* Educational Certificates */}
        <SectionCard>
          <CardHeader title="Educational Certificates" badge={{ label: 'Expired', variant: 'urgent' }} />
          <Text style={styles.expiredNote}>MBBS Degree — expired, please re-upload</Text>
        </SectionCard>

        {/* Add button */}
        <TouchableOpacity
          style={styles.outlineBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('DocumentUpload')}
        >
          <Text style={styles.outlineBtnText}>+ Add Other Document</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },

  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
  },
  appbarTitle: { fontSize: 16.5, fontWeight: '800', color: '#14202E' },
  spacer: { flex: 1 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 18, color: '#0F3D5C', fontWeight: '400', lineHeight: 22 },

  body: { paddingHorizontal: 18, paddingBottom: 20 },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: { fontSize: 12.5, fontWeight: '800', color: '#14202E' },
  cardMeta: { fontSize: 11, color: '#5C6B7A' },

  badge: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { fontSize: 10.5, fontWeight: '700' },

  subList: { marginTop: 6 },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE4EA',
  },
  subRowLast: { borderBottomWidth: 0 },
  subRowLabel: { fontSize: 11.5, color: '#14202E', flex: 1 },

  expiredNote: { fontSize: 11, color: '#C0392B', marginTop: 4 },

  outlineBtn: {
    borderWidth: 1.5,
    borderColor: '#0F3D5C',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 4,
  },
  outlineBtnText: { fontSize: 13, fontWeight: '700', color: '#0F3D5C' },
});
