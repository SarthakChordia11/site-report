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
import type { ModuleId } from '../../types';
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

      {/* Sidebar Container: Deep Industrial Slate #0B0E17 */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B0E17] border-r border-white/10 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Section: Logo & Nav Items */}
        <div className="p-5">
          {/* Brand Logo */}
          <div className="pb-6 border-b border-white/10">
            <SiteReportLogo isDark={true} size="md" />
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-2">
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
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-neutral-950 shadow-lg'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span 
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive 
                          ? 'bg-neutral-950 text-white' 
                          : 'bg-white/10 text-[#FF5E14] border border-white/10'
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

        <div className="p-5 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-2xl bg-[#161A24] border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FF5E14]/20 border border-[#FF5E14]/30 flex items-center justify-center font-bold text-[#FF5E14] text-xs uppercase">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'User'}</p>
              <p className="text-[11px] text-neutral-400 truncate capitalize">{currentUser?.role?.replace('_', ' ') || 'Site Lead'}</p>
            </div>
          </div>

          <button
            id="sidebar-logout-btn"
            onClick={onLogOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-neutral-500" />
            <span>Back to Home</span>
          </button>
        </div>
      </aside>
    </>
  );
};
