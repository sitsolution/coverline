import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import SelectRoleScreen from '../screens/auth/SelectRoleScreen';
import SignUpDoctorScreen from '../screens/auth/SignUpDoctorScreen';
import SignUpAdminScreen from '../screens/auth/SignUpAdminScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';

export type AuthStackParamList = {
  Splash: undefined;
  SelectRole: undefined;
  SignUpDoctor: undefined;
  SignUpAdmin: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  OTPVerification: { email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="SelectRole" component={SelectRoleScreen} />
      <Stack.Screen name="SignUpDoctor" component={SignUpDoctorScreen} />
      <Stack.Screen name="SignUpAdmin" component={SignUpAdminScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    </Stack.Navigator>
  );
}
