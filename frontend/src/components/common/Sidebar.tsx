import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  Package, 
  Wrench, 
  BarChart3, 
  Settings, 
  LogOut,
  FolderKanban,
  Files
} from 'lucide-react';
import { ModuleId } from '../../types';
import { SiteReportLogo } from './SiteReportLogo';
import { authHelpers } from '../../services/api';

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  onLogOut: () => void;
  reportsCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  onLogOut,
  reportsCount = 128,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems: { id: ModuleId; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Reports', icon: FileText, badge: `${reportsCount}` },
    { id: 'labour', label: 'Projects & Labour', icon: Building2 },
    { id: 'resource', label: 'Documents & Materials', icon: Files },
    { id: 'equipment', label: 'Equipment & Plant', icon: Wrench },
    { id: 'cost', label: 'Analytics & EVM', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const currentUser = authHelpers.getUser();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container: Carbon Black #0E0E0E matching reference image */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0E0E0E] border-r border-[#262626] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Section: Logo & Nav Items */}
        <div className="p-5">
          {/* Brand Logo */}
          <div className="pb-6 border-b border-[#262626]">
            <SiteReportLogo isDark={true} size="md" />
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    onSelectModule(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF6A00] text-white shadow-md shadow-[#FF6A00]/25'
                      : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#A3A3A3]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span 
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive 
                          ? 'bg-black/30 text-white' 
                          : 'bg-[#1F1F1F] text-[#FF6A00] border border-[#FF6A00]/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-5 border-t border-[#262626] space-y-3">
          <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF6A00] flex items-center justify-center font-bold text-white text-xs uppercase">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'User'}</p>
              <p className="text-[11px] text-[#A3A3A3] truncate capitalize">{currentUser?.role?.replace('_', ' ') || 'Site Lead'}</p>
            </div>
          </div>

          <button
            id="sidebar-logout-btn"
            onClick={onLogOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#737373]" />
            <span>Back to Home</span>
          </button>
        </div>
      </aside>
    </>
  );
};
