import React from 'react';
import { ArrowLeft, Calculator } from 'lucide-react';
import { EstimatorModule } from '../modules/estimator/EstimatorModule';

interface EstimatorDashboardProps {
  onBackToLanding: () => void;
}

export const EstimatorDashboard: React.FC<EstimatorDashboardProps> = ({
  onBackToLanding,
}) => {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Minimal Header */}
      <header className="bg-[#0E0E0E] border-b border-[#262626] px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF6A00] flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Cost Estimator</h1>
            <p className="text-xs text-[#A3A3A3]">Free BOQ & Material Calculator</p>
          </div>
        </div>
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-[#262626] text-white text-xs font-medium rounded-lg border border-[#333333] hover:border-[#FF6A00] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Estimator Content — nothing else */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <EstimatorModule />
      </div>
    </div>
  );
};
