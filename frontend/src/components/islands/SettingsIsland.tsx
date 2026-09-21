import React from 'react';
import { useStore } from '@nanostores/react';
import { $isLoggedIn } from '../../stores/authStore';
import { SettingsView } from '../modules/settings/SettingsView';

export default function SettingsIsland() {
  const isLoggedIn = useStore($isLoggedIn);

  if (!isLoggedIn) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  return <SettingsView />;
}
