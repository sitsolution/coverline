import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, ViewStyle } from 'react-native';
export type ToastType = 'success' | 'error' | 'info';

type Props = {
  visible: boolean;
  message: string;
  type?: ToastType;
  /** ms before auto-dismiss; pass 0 to disable auto-dismiss */
  duration?: number;
  onDismiss?: () => void;
  /** Override bottom offset (default 80 — sits above tab bar) */
  bottom?: number;
  style?: ViewStyle;
};

const TYPE_ICON: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  info:    'i',
};

const TYPE_ICON_BG: Record<ToastType, string> = {
  success: '#1F8A5F',
  error:   '#C0392B',
  info:    '#175E86',
};

/**
 * 4.4 – Toast notification
 * Slides up from the bottom, auto-dismisses after `duration` ms.
 * Place it at the root of the screen (inside SafeAreaView) so it floats above content.
 *
 * Usage:
 *   const [toast, setToast] = useState({ visible: false, message: '' });
 *
 *   // Show:
 *   setToast({ visible: true, message: 'Shift applied successfully' });
 *
 *   // In JSX:
 *   <Toast
 *     visible={toast.visible}
 *     message={toast.message}
 *     onDismiss={() => setToast(t => ({ ...t, visible: false }))}
 *   />
 */
export default function Toast({
  visible,
  message,
  type     = 'success',
  duration = 3000,
  onDismiss,
  bottom   = 80,
  style,
}: Props) {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacity,    { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      if (duration > 0 && onDismiss) {
        timerRef.current = setTimeout(onDismiss, duration);
      }
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(translateY, { toValue: 100, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 0,   duration: 150, useNativeDriver: true }),
      ]).start();
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visible, duration]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        { bottom, transform: [{ translateY }], opacity },
        style,
      ]}
    >
      <Animated.View style={[styles.iconBubble, { backgroundColor: TYPE_ICON_BG[type] }]}>
        <Text style={styles.iconText}>{TYPE_ICON[type]}</Text>
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#0B2D45',
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    zIndex: 999,
  },
  iconBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  message:  { fontSize: 12, color: '#fff', flex: 1 },
});
