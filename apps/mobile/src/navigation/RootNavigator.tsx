import React, { useState } from 'react';
import AuthNavigator from './AuthNavigator';
import StaffNavigator from './StaffNavigator';

export default function RootNavigator() {
  // TODO: replace with real auth state check
  const isAuthenticated = true;

  return isAuthenticated ? <StaffNavigator /> : <AuthNavigator />;
}
