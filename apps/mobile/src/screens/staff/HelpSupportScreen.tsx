import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import Screen from '../../components/ui/Screen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'HelpSupport'>;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'How do I get my documents verified?' },
  { q: 'When will I receive my payment?' },
  { q: 'Can I cancel a confirmed shift?' },
  { q: 'How do I update my availability?' },
  { q: 'What happens if a hospital cancels a shift?' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FAQRow({ question, isLast }: { question: string; isLast?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.faqRow, isLast && styles.faqRowLast]}
      onPress={() => setOpen(o => !o)}
      activeOpacity={0.7}
    >
      <View style={styles.faqAvatar}>
        <Text style={styles.faqAvatarText}>❓</Text>
      </View>
      <View style={styles.faqContent}>
        <Text style={styles.faqQ}>{question}</Text>
        {open ? (
          <Text style={styles.faqA}>
            Contact our support team for a detailed answer to this question.
          </Text>
        ) : null}
      </View>
      <Text style={styles.chevron}>{open ? '˄' : '˅'}</Text>
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HelpSupportScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Screen style={styles.container}>
      {/* App Bar */}
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>Help & Support</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>

        {/* Search */}
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍  Search FAQs"
            placeholderTextColor="#A9B8C4"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View>
          {filtered.length > 0
            ? filtered.map((f, i) => (
                <FAQRow key={f.q} question={f.q} isLast={i === filtered.length - 1} />
              ))
            : (
                <Text style={styles.noResults}>No FAQs match your search.</Text>
              )
          }
        </View>

        {/* Contact Us */}
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactCard}>
          <Text style={styles.contactNote}>
            Our support team typically replies within 2 hours.
          </Text>
          <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>💬  Live Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnOutline}
            activeOpacity={0.85}
            onPress={() => Linking.openURL('mailto:support@coverline.in')}
          >
            <Text style={styles.btnOutlineText}>📧  Email Support</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </Screen>
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
  backBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow:    { fontSize: 18, color: '#0F3D5C', lineHeight: 22 },
  appbarTitle:  { fontSize: 16.5, fontWeight: '800', color: '#14202E' },
  spacer:       { flex: 1 },

  body: { paddingHorizontal: 18, paddingBottom: 28 },

  // Search
  searchWrap: { marginBottom: 2 },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1.4,
    borderColor: '#DCE4EA',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12.5,
    color: '#14202E',
  },

  // Section title
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#14202E',
    marginTop: 18,
    marginBottom: 10,
  },

  // FAQ rows — transparent, border-bottom dividers
  faqRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE4EA',
  },
  faqRowLast: { borderBottomWidth: 0 },
  faqAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  faqAvatarText: { fontSize: 14 },
  faqContent:    { flex: 1 },
  faqQ:          { fontSize: 12.5, fontWeight: '700', color: '#14202E' },
  faqA:          { fontSize: 11.5, color: '#5C6B7A', marginTop: 5, lineHeight: 17 },
  chevron:       { fontSize: 13, color: '#8697A6', marginTop: 2 },

  noResults: { fontSize: 12, color: '#5C6B7A', paddingVertical: 14, textAlign: 'center' },

  // Contact card
  contactCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    borderRadius: 12,
    padding: 14,
  },
  contactNote: { fontSize: 12, color: '#5C6B7A', marginBottom: 10, lineHeight: 17 },

  btnPrimary: {
    backgroundColor: '#0F3D5C',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnPrimaryText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0F3D5C',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  btnOutlineText: { fontSize: 13, fontWeight: '700', color: '#0F3D5C' },
});
