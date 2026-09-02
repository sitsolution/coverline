import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DocsScreen from '../screens/staff/DocsScreen';
import DocumentUploadScreen from '../screens/staff/DocumentUploadScreen';

export type DocsStackParamList = {
  DocsList: undefined;
  DocumentUpload: undefined;
};

const Stack = createNativeStackNavigator<DocsStackParamList>();

export default function DocsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DocsList" component={DocsScreen} />
      <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
    </Stack.Navigator>
  );
}
