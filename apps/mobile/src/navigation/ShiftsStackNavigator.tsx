import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ShiftsScreen from '../screens/staff/ShiftsScreen';
import ShiftDetailsScreen from '../screens/staff/ShiftDetailsScreen';
import MyApplicationsScreen from '../screens/staff/MyApplicationsScreen';

export type ShiftsStackParamList = {
  ShiftsList: undefined;
  ShiftDetails: { shiftId: number };
  MyApplications: undefined;
};

const Stack = createNativeStackNavigator<ShiftsStackParamList>();

export default function ShiftsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShiftsList" component={ShiftsScreen} />
      <Stack.Screen name="ShiftDetails" component={ShiftDetailsScreen} />
      <Stack.Screen name="MyApplications" component={MyApplicationsScreen} />
    </Stack.Navigator>
  );
}
