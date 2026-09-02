import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  dismissLabel?: string;
  /** 'danger' uses red tinted button; 'primary' uses navy */
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onDismiss: () => void;
};

/**
 * 4.4 – Confirmation bottom-sheet modal
 * Semi-transparent backdrop, slides up from the bottom.
 *
 * Usage:
 *   const [modal, setModal] = useState(false);
 *
 *   <ConfirmModal
 *     visible={modal}
 *     title="Cancel this application?"
 *     description="You won't be able to reapply once it's filled."
 *     confirmLabel="Yes, Cancel Application"
 *     dismissLabel="Keep Application"
 *     confirmVariant="danger"
 *     onConfirm={handleCancel}
 *     onDismiss={() => setModal(false)}
 *   />
 */
export default function ConfirmModal({
  visible,
  title,
  description,
  confirmLabel   = 'Confirm',
  dismissLabel   = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onDismiss,
}: Props) {
  const slideY  = useRef(new Animated.Value(300)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY,    { toValue: 0, useNativeDriver: true, tension: 75, friction: 11 }),
        Animated.timing(bgOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY,    { toValue: 300, duration: 220, useNativeDriver: true }),
        Animated.timing(bgOpacity, { toValue: 0,   duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const confirmBtnStyle = confirmVariant === 'danger' ? styles.btnDanger : styles.btnPrimary;
  const confirmTextStyle = confirmVariant === 'danger' ? styles.btnDangerText : styles.btnPrimaryText;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: bgOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideY }] }]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <TouchableOpacity
          style={[styles.btn, confirmBtnStyle, { marginBottom: 8 }]}
          onPress={onConfirm}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnText, confirmTextStyle]}>{confirmLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onDismiss} activeOpacity={0.8}>
          <Text style={[styles.btnText, styles.btnGhostText]}>{dismissLabel}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,45,69,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 26,
  },
  title:       { fontSize: 14.5, fontWeight: '800', color: '#14202E', marginBottom: 8 },
  description: { fontSize: 12, color: '#5C6B7A', marginBottom: 18, lineHeight: 18 },
  btn:         { borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  btnText:     { fontSize: 13, fontWeight: '700' },

  btnPrimary:     { backgroundColor: '#0F3D5C' },
  btnPrimaryText: { color: '#fff' },

  btnDanger:     { backgroundColor: '#FBE7E4' },
  btnDangerText: { color: '#C0392B' },

  btnGhost:     { backgroundColor: 'transparent' },
  btnGhostText: { color: '#5C6B7A', fontWeight: '600' },
});
