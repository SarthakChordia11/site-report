import { atom } from 'nanostores';
import type { Site } from '../types/index';

export const $sites = atom<Site[]>([]);
export const $currentSite = atom<Site | null>(null);

export function setCurrentSite(site: Site | null) {
  $currentSite.set(site);
}

export function setSites(sites: Site[]) {
  $sites.set(sites);
  if (sites.length > 0 && !$currentSite.get()) {
    $currentSite.set(sites[0]);
  }
}
