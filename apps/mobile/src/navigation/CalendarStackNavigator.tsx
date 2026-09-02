import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalendarScreen from '../screens/staff/CalendarScreen';
import SetAvailabilityScreen from '../screens/staff/SetAvailabilityScreen';

export type CalendarStackParamList = {
  CalendarMain: undefined;
  SetAvailability: undefined;
};

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export default function CalendarStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarMain" component={CalendarScreen} />
      <Stack.Screen name="SetAvailability" component={SetAvailabilityScreen} />
    </Stack.Navigator>
  );
}
