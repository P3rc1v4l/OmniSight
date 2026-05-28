import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Profile } from '$lib/types';

/**
 * Hasht eine 4-stellige PIN mit SHA-256.
 * Hinweis: Eine PIN ist nur ein Komfort-Schutz (kein echter Tresor). Für echte
 * Vertraulichkeit müsste man die Profildaten zusätzlich verschlüsseln –
 * das ist als späterer Schritt vorgesehen (siehe Verbesserungsvorschläge).
 */
export async function hashPin(pin: string): Promise<string> {
	const data = new TextEncoder().encode(`omnihub:${pin}`);
	const digest = await crypto.subtle.digest('SHA-256', data);
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(pin: string, hash: string | null): Promise<boolean> {
	if (!hash) return true; // kein PIN gesetzt
	return (await hashPin(pin)) === hash;
}

function createDefaultProfile(): Profile {
	return { id: crypto.randomUUID(), name: 'Profil 1', avatar: undefined, pinHash: null };
}

// Mindestens 1, maximal 5 Profile.
export const MAX_PROFILES = 5;
export const MIN_PROFILES = 1;

export const profiles = writable<Profile[]>(browser ? [createDefaultProfile()] : []);
export const activeProfileId = writable<string | null>(null);
