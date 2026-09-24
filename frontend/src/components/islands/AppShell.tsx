import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $isLoggedIn, clearSession } from '../../stores/authStore';
import { $currentSite, $sites, setSites, setCurrentSite } from '../../stores/siteStore';
import { Sidebar } from '../common/Sidebar';
import { Header } from '../common/Header';
import { sitesApi } from '../../services/api';
import type { ModuleId } from '../../types';

interface AppShellProps {
  activeModule: ModuleId;
  children?: React.ReactNode;
}

export default function AppShell({ activeModule, children }: AppShellProps) {
  const isLoggedIn = useStore($isLoggedIn);
  const currentSite = useStore($currentSite);
  const sites = useStore($sites);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    if (sites.length === 0) {
      sitesApi.list().then((data) => setSites(data)).catch(console.error);
    }
  }, [isLoggedIn, sites.length]);

  const handleNavigate = (module: ModuleId) => {
    window.location.href = `/app/${module}`;
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar
        activeModule={activeModule}
        onSelectModule={handleNavigate}
        onLogOut={() => {
          clearSession();
          window.location.href = '/login';
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          currentSite={currentSite}
          sites={sites}
          onSelectSite={setCurrentSite}
          activeModule={activeModule}
          onSelectModule={handleNavigate}
          onOpenAIModal={() => {}}
          onBackToLanding={() => {
            window.location.href = '/';
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onAddSite={() => setIsAddSiteModalOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
