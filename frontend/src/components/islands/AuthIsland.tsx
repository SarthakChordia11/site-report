import React from 'react';
import { AuthPage } from '../auth/AuthPage';
import { saveSession } from '../../stores/authStore';

export default function AuthIsland() {
  const handleAuthSuccess = () => {
    window.location.href = '/app/dashboard';
  };

  return <AuthPage onAuthSuccess={handleAuthSuccess} />;
}
