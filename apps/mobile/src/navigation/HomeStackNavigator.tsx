import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/staff/DashboardScreen';
import NotificationsScreen from '../screens/staff/NotificationsScreen';
import MessagesListScreen from '../screens/staff/MessagesListScreen';
import ChatScreen from '../screens/staff/ChatScreen';

export type HomeStackParamList = {
  Dashboard: undefined;
  Notifications: undefined;
  MessagesList: undefined;
  Chat: { roomKey: string; adminName: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="MessagesList" component={MessagesListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
