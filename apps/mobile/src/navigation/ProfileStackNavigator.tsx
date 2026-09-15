import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/staff/ProfileScreen';
import EditProfileScreen from '../screens/staff/EditProfileScreen';
import MyActivityScreen from '../screens/staff/MyActivityScreen';
import SettingsScreen from '../screens/staff/SettingsScreen';
import HelpSupportScreen from '../screens/staff/HelpSupportScreen';
import ChangePasswordScreen from '../screens/staff/ChangePasswordScreen';
import DataSecurityScreen from '../screens/staff/DataSecurityScreen';
import ChatScreen from '../screens/staff/ChatScreen';
import MessagesListScreen from '../screens/staff/MessagesListScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  MyActivity: undefined;
  Settings: undefined;
  HelpSupport: undefined;
  ChangePassword: undefined;
  DataSecurity: undefined;
  MessagesList: undefined;
  Chat: { roomKey: string; adminName: string };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MyActivity" component={MyActivityScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="DataSecurity" component={DataSecurityScreen} />
      <Stack.Screen name="MessagesList" component={MessagesListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
