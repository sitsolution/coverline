import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import AuthNavigator from './AuthNavigator';
import StaffNavigator from './StaffNavigator';
import { useAuth } from '../store/auth';

export default function RootNavigator() {
  const { accessToken, isVerified, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F8FA' }}>
        <ActivityIndicator size="large" color="#0F3D5C" />
      </View>
    );
  }

  return accessToken && isVerified ? <StaffNavigator /> : <AuthNavigator />;
}
