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
    <header className="sticky top-0 z-30 bg-[#08090C]/90 backdrop-blur-md border-b border-white/10 text-white shadow-sm">
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Left Section: Mobile Menu & Site Switcher */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 lg:hidden cursor-pointer"
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
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-[#FF5E14]" />
              <span className="max-w-[180px] lg:max-w-[240px] truncate">
                {currentSite ? currentSite.name : 'No Site Selected'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
            </button>

            {siteMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-[#10131A] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in">
                <p className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Select Construction Site</p>
                {sites.length === 0 && (
                  <p className="px-3 py-2 text-xs text-neutral-500 italic">No sites created yet.</p>
                )}
                {sites.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectSite(s);
                      setSiteMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                      s.id === currentSite?.id ? 'bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <Building2 className={`w-4 h-4 mt-0.5 ${s.id === currentSite?.id ? 'text-[#FF5E14]' : 'text-neutral-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold">{s.name}</p>
                      <p className={`text-[10px] ${s.id === currentSite?.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {s.location} • ₹{(s.budgetTotal / 10000000).toFixed(0)} Cr
                      </p>
                    </div>
                  </button>
                ))}
                
                <div className="border-t border-white/10 mt-1.5 pt-1.5">
                  <button
                    onClick={() => {
                      setSiteMenuOpen(false);
                      onAddSite?.();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-white/5 text-[#FF5E14] rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-semibold text-xs"
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
          {/* Quick Voice Log Button - Crisp White Pill */}
          <button
            id="header-voice-btn"
            onClick={() => onOpenAIModal('voice')}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-full text-xs shadow-md transition-all cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-neutral-950" />
            <span className="hidden sm:inline">Voice Log</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF5E14]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#10131A] border border-white/10 rounded-2xl shadow-2xl z-50 p-4 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-bold text-white">Notifications</span>
                  <span className="text-[10px] text-neutral-400 font-semibold">0 New</span>
                </div>
                <div className="p-4 text-center text-neutral-500">
                  No new notifications
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-white/10" />

          {/* User Profile Pill Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#FF5E14]/20 border border-[#FF5E14]/30 flex items-center justify-center text-[#FF5E14] font-bold text-xs">
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-white">{currentUser?.name || 'User'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#10131A] border border-white/10 rounded-2xl shadow-2xl z-50 p-1.5 text-xs animate-in fade-in">
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="font-bold text-white">{currentUser?.name || 'User'}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{currentUser?.email || 'user@example.com'}</p>
                </div>
                <button
                  onClick={() => {
                    onSelectModule('settings');
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-white/5 text-neutral-300 rounded-xl transition-colors cursor-pointer font-medium"
                >
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    onBackToLanding();
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-white/5 text-[#FF5E14] rounded-xl transition-colors cursor-pointer font-medium"
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
