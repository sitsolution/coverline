import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import HomeStackNavigator, { HomeStackParamList } from './HomeStackNavigator';
import ShiftsStackNavigator, { ShiftsStackParamList } from './ShiftsStackNavigator';
import CalendarStackNavigator, { CalendarStackParamList } from './CalendarStackNavigator';
import DocsStackNavigator, { DocsStackParamList } from './DocsStackNavigator';
import ProfileStackNavigator, { ProfileStackParamList } from './ProfileStackNavigator';

export type StaffTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Shifts: NavigatorScreenParams<ShiftsStackParamList>;
  Calendar: NavigatorScreenParams<CalendarStackParamList>;
  Docs: NavigatorScreenParams<DocsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

const Tab = createBottomTabNavigator<StaffTabParamList>();

const ACTIVE = '#0F3D5C';
const INACTIVE = '#8697A6';

const items: [string, string, keyof StaffTabParamList][] = [
  ['🏠', 'Home', 'Home'],
  ['🩺', 'Shifts', 'Shifts'],
  ['📅', 'Calendar', 'Calendar'],
  ['📁', 'Docs', 'Docs'],
  ['👤', 'Profile', 'Profile'],
];

const SCREEN_MAP = {
  Home: HomeStackNavigator,
  Shifts: ShiftsStackNavigator,
  Calendar: CalendarStackNavigator,
  Docs: DocsStackNavigator,
  Profile: ProfileStackNavigator,
};

export default function StaffNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#DCE4EA',
          height: 62,
          paddingBottom: 6,
          paddingTop: 6,
        },
      }}
    >
      {items.map(([ic, label, name]) => (
        <Tab.Screen
          key={name}
          name={name}
          component={SCREEN_MAP[name]}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabItem}>
                <Text style={styles.ic}>{ic}</Text>
                <Text style={[styles.label, { color: focused ? ACTIVE : INACTIVE, fontWeight: focused ? '700' : '600' }]}>
                  {label}
                </Text>
              </View>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  ic: { fontSize: 16 },
  label: { fontSize: 9.5, marginTop: 2 },
});
