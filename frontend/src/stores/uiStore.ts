import { atom } from 'nanostores';

export const $isMobileSidebarOpen = atom<boolean>(false);
export const $isAddSiteModalOpen = atom<boolean>(false);
export const $aiModalState = atom<{ isOpen: boolean; mode: 'voice' | 'form' | 'document' }>({ isOpen: false, mode: 'voice' });
