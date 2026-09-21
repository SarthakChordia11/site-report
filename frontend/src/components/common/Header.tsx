import React, { useState } from 'react';
import { 
  Building2, 
  Mic, 
  Camera, 
  ChevronDown, 
  Calendar, 
  ShieldCheck, 
  Bell,
  Menu,
  Sparkles,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { Site, ModuleId } from '../../types';
import { SiteReportLogo } from './SiteReportLogo';
import { authHelpers } from '../../services/api';

interface HeaderProps {
  currentSite: Site | null;
  sites: Site[];
  onSelectSite: (site: Site) => void;
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  onOpenAIModal: (mode?: 'voice' | 'photo' | 'form') => void;
  onBackToLanding: () => void;
  onToggleMobileSidebar?: () => void;
  onAddSite?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSite,
  sites,
  onSelectSite,
  activeModule,
  onSelectModule,
  onOpenAIModal,
  onBackToLanding,
  onToggleMobileSidebar,
  onAddSite,
}) => {
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const currentUser = authHelpers.getUser();

  return (
    <header className="sticky top-0 z-30 bg-[#0E0E0E] border-b border-[#262626] text-white shadow-sm">
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Left Section: Mobile Menu & Site Switcher */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] text-[#A3A3A3] hover:text-white lg:hidden cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Logo visible on smaller screens when sidebar collapsed */}
          <div className="lg:hidden">
            <SiteReportLogo isDark={true} size="sm" />
          </div>

          {/* Project Switcher Dropdown */}
          <div className="relative hidden sm:block">
            <button
              id="header-site-selector-btn"
              onClick={() => setSiteMenuOpen(!siteMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span className="max-w-[180px] lg:max-w-[240px] truncate">
                {currentSite ? currentSite.name : 'No Site Selected'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#737373] ml-0.5" />
            </button>

            {siteMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-[#141414] border border-[#262626] rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in">
                <p className="px-3 py-1.5 text-[10px] font-bold text-[#737373] uppercase tracking-wider">Select Construction Site</p>
                {sites.length === 0 && (
                  <p className="px-3 py-2 text-xs text-[#737373] italic">No sites created yet.</p>
                )}
                {sites.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectSite(s);
                      setSiteMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                      s.id === currentSite?.id ? 'bg-[#FF6A00] text-white font-bold' : 'text-[#D4D4D4] hover:bg-[#1A1A1A]'
                    }`}
                  >
                    <Building2 className={`w-4 h-4 mt-0.5 ${s.id === currentSite?.id ? 'text-white' : 'text-[#FF6A00]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold">{s.name}</p>
                      <p className={`text-[10px] ${s.id === currentSite?.id ? 'text-white/80' : 'text-[#737373]'}`}>
                        {s.location} • ₹{(s.budgetTotal / 10000000).toFixed(0)} Cr
                      </p>
                    </div>
                  </button>
                ))}
                
                <div className="border-t border-[#262626] mt-1 pt-1">
                  <button
                    onClick={() => {
                      setSiteMenuOpen(false);
                      onAddSite?.();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#1A1A1A] text-[#FF6A00] rounded-lg transition-colors flex items-center gap-2 cursor-pointer font-semibold text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Site</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Actions, Notifications, User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Voice Log Button */}
          <button
            id="header-voice-btn"
            onClick={() => onOpenAIModal('voice')}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#FF6A00] hover:bg-[#E65F00] text-white font-bold rounded-lg text-xs shadow-sm shadow-[#FF6A00]/25 transition-all cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voice Log</span>
          </button>

          {/* Quick Challan OCR Button */}


          {/* Notification Bell matching reference */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] text-[#D4D4D4] hover:text-white transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6A00]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#141414] border border-[#262626] rounded-xl shadow-2xl z-50 p-4 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                  <span className="font-bold text-white">Notifications</span>
                  <span className="text-[10px] text-[#737373] font-semibold">0 New</span>
                </div>
                <div className="p-4 text-center text-[#737373]">
                  No new notifications
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-[#262626]" />

          {/* User Profile Dropdown matching reference image: "Project Manager ▾" */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#1A1A1A] transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-[#FF6A00] flex items-center justify-center text-white font-extrabold text-xs">
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-white">{currentUser?.name || 'User'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-[#141414] border border-[#262626] rounded-xl shadow-2xl z-50 p-1.5 text-xs animate-in fade-in">
                <div className="px-3 py-2 border-b border-[#262626]">
                  <p className="font-bold text-white">{currentUser?.name || 'User'}</p>
                  <p className="text-[10px] text-[#737373] truncate">{currentUser?.email || 'user@example.com'}</p>
                </div>
                <button
                  onClick={() => {
                    onSelectModule('settings');
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#1A1A1A] text-[#D4D4D4] rounded-lg transition-colors cursor-pointer font-medium"
                >
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    onBackToLanding();
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#1A1A1A] text-[#FF6A00] rounded-lg transition-colors cursor-pointer font-medium"
                >
                  Exit to Landing
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
