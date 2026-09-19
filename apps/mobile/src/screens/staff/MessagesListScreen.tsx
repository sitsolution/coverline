import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/HomeStackNavigator';
import chatService, { ChatRoomOut } from '../../services/chatService';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'MessagesList'>;
};

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function initials(name: string | undefined | null): string {
  if (!name) return '?';
  const parts = name.replace(/\./g, '').split(' ').filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MessagesListScreen({ navigation }: Props) {
  const [rooms, setRooms] = useState<ChatRoomOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await chatService.listMyRooms();
      setRooms(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const openChat = (room: ChatRoomOut) => {
    navigation.navigate('Chat', {
      roomKey: room.roomKey,
      adminName: room.adminName,
    });
  };

  const renderRoom = ({ item }: { item: ChatRoomOut }) => (
    <TouchableOpacity style={styles.row} onPress={() => openChat(item)} activeOpacity={0.75}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(item.adminName)}</Text>
      </View>

      {/* Text */}
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={[styles.adminName, item.unreadCount > 0 && styles.adminNameUnread]} numberOfLines={1}>
            {item.adminName}
          </Text>
          <Text style={styles.time}>{timeAgo(item.lastMessageAt)}</Text>
        </View>
        {item.facilityName ? (
          <Text style={styles.facilityName} numberOfLines={1}>{item.facilityName}</Text>
        ) : null}
        <Text style={[styles.preview, item.unreadCount > 0 && styles.previewUnread]} numberOfLines={1}>
          {item.lastMessageBody ?? 'No messages yet'}
        </Text>
      </View>

      {/* Unread badge */}
      {item.unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unreadCount > 9 ? '9+' : item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* App Bar */}
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>Messages</Text>
        <View style={styles.spacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#1A2E52" />
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(r) => String(r.id)}
          renderItem={renderRoom}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A2E52" colors={['#1A2E52']} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={rooms.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>Your facility admin will reach out to you here.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF3',
    backgroundColor: '#fff',
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  backArrow: { fontSize: 28, color: '#1A2E52', lineHeight: 32 },
  appbarTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '800', color: '#1A2E52' },
  spacer: { width: 36 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#E8F0FB',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#1A2E52' },
  rowBody: { flex: 1, minWidth: 0 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  adminName: { fontSize: 13.5, fontWeight: '700', color: '#1A2E52', flex: 1, marginRight: 8 },
  adminNameUnread: { fontWeight: '800' },
  time: { fontSize: 11, color: '#A9B8C4', flexShrink: 0 },
  facilityName: { fontSize: 11, color: '#5A7A94', marginBottom: 2 },
  preview: { fontSize: 12, color: '#7A90A4' },
  previewUnread: { color: '#1A2E52', fontWeight: '600' },
  badge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: '#C0392B',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 5, marginLeft: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  separator: { height: 1, backgroundColor: '#F0F4F7', marginLeft: 74 },
  emptyContainer: { flex: 1 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: '#1A2E52', marginBottom: 6 },
  emptyText: { fontSize: 13, color: '#7A90A4', textAlign: 'center', lineHeight: 20 },
});
