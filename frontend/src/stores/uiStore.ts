import { atom } from 'nanostores';
import type { InputMode, ModuleId } from '../types/index';

export const $aiModalOpen = atom<boolean>(false);
export const $aiModalMode = atom<InputMode>('voice');
export const $syncToast = atom<{ text: string; module: ModuleId } | null>(null);

export function openAIModal(mode: InputMode = 'voice') {
  $aiModalMode.set(mode);
  $aiModalOpen.set(true);
}

export function closeAIModal() {
  $aiModalOpen.set(false);
}

export function showSyncToast(text: string, module: ModuleId) {
  $syncToast.set({ text, module });
  setTimeout(() => $syncToast.set(null), 5000);
}
