import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $isLoggedIn } from '../../stores/authStore';
import { LandingPage } from '../landing/LandingPage';

export default function LandingIsland() {
  const isLoggedIn = useStore($isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      window.location.href = '/app/dashboard';
    }
  }, [isLoggedIn]);

  const handleLaunchApp = (module?: string) => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    } else {
      window.location.href = `/app/${module || 'dashboard'}`;
    }
  };

  const handleLaunchEstimator = () => {
    window.location.href = '/estimator';
  };

  const handleOpenAIModal = () => {
    window.location.href = '/login';
  };

  return (
    <LandingPage
      onLaunchApp={handleLaunchApp as any}
      onLaunchEstimator={handleLaunchEstimator}
      onOpenAIModal={handleOpenAIModal}
    />
  );
}
