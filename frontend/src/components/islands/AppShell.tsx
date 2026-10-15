import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $isLoggedIn, clearSession } from '../../stores/authStore';
import { $currentSite, $sites, setSites, setCurrentSite } from '../../stores/siteStore';
import { $isMobileSidebarOpen, $isAddSiteModalOpen, $aiModalState } from '../../stores/uiStore';
import { Sidebar } from '../common/Sidebar';
import { Header } from '../common/Header';
import { AddSiteModal } from '../modules/dashboard/AddSiteModal';
import { GlobalAIModal } from '../ai/GlobalAIModal';
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
  const isMobileSidebarOpen = useStore($isMobileSidebarOpen);
  const isAddSiteModalOpen = useStore($isAddSiteModalOpen);
  const aiModalState = useStore($aiModalState);

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
        onCloseMobile={() => $isMobileSidebarOpen.set(false)}
      />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          currentSite={currentSite}
          sites={sites}
          onSelectSite={setCurrentSite}
          activeModule={activeModule}
          onSelectModule={handleNavigate}
          onOpenAIModal={(mode) => $aiModalState.set({ isOpen: true, mode: mode || 'voice' })}
          onBackToLanding={() => {
            window.location.href = '/';
          }}
          onToggleMobileSidebar={() => $isMobileSidebarOpen.set(true)}
          onAddSite={() => $isAddSiteModalOpen.set(true)}
        />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>

      <AddSiteModal
        isOpen={isAddSiteModalOpen}
        onClose={() => $isAddSiteModalOpen.set(false)}
        onSiteCreated={(newSite) => {
          const updated = [...sites, newSite];
          setSites(updated);
          setCurrentSite(newSite);
        }}
      />

      <GlobalAIModal
        isOpen={aiModalState.isOpen}
        initialMode={aiModalState.mode}
        onClose={() => $aiModalState.set({ isOpen: false, mode: 'voice' })}
        onApplyExtraction={async () => {
          $aiModalState.set({ isOpen: false, mode: 'voice' });
          window.location.reload();
        }}
        onModulesSynced={() => {
          window.location.reload();
        }}
        trades={[]}
        materials={[]}
        equipment={[]}
        activeSiteId={currentSite?.id ?? null}
      />
    </div>
  );
}
