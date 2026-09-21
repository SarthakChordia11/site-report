import { atom, computed } from 'nanostores';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const $token = atom<string | null>(
  typeof localStorage !== 'undefined' ? localStorage.getItem('sm_token') : null
);

export const $user = atom<AuthUser | null>(
  typeof localStorage !== 'undefined'
    ? (() => { try { const u = localStorage.getItem('sm_user'); return u ? JSON.parse(u) : null; } catch { return null; } })()
    : null
);

export const $isLoggedIn = computed($token, (token) => !!token);

export function saveSession(token: string, user: AuthUser) {
  $token.set(token);
  $user.set(user);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('sm_token', token);
    localStorage.setItem('sm_user', JSON.stringify(user));
  }
}

export function clearSession() {
  $token.set(null);
  $user.set(null);
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('sm_token');
    localStorage.removeItem('sm_user');
  }
}
