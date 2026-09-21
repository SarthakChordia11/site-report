import React from 'react';
import { EstimatorDashboard } from './EstimatorDashboard';

export const EstimatorPage: React.FC = () => {
  return <EstimatorDashboard onBackToLanding={() => window.location.assign('/')} />;
};
