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
    <div className="min-h-screen bg-[#08090C] bg-grid text-white">
      {/* Minimal Header */}
      <header className="bg-[#08090C]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-sky-400">
            <Calculator className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Cost Estimator</h1>
            <p className="text-xs text-neutral-400">BOQ, Material Quantity & Budget Calculator</p>
          </div>
        </div>
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-full border border-white/15 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Estimator Content */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <EstimatorModule />
      </div>
    </div>
  );
};
