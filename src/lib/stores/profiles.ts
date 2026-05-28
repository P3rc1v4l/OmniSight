import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { Profile } from '$lib/types';
import { loadState, saveState } from '$lib/persistence';

export async function hashPin(pin: string): Promise<string> {
	const data = new TextEncoder().encode(`omnihub:${pin}`);
	const digest = await crypto.subtle.digest('SHA-256', data);
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(pin: string, hash: string | null): Promise<boolean> {
	if (!hash) return true;
	return (await hashPin(pin)) === hash;
}

export const MAX_PROFILES = 5;
export const MIN_PROFILES = 1;

function defaultProfile(): Profile {
	return {
		id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `p-${Date.now()}`,
		name: 'Profil 1',
		pinHash: null
	};
}

export const profiles = writable<Profile[]>([]);
export const activeProfileId = writable<string | null>(null);

let loaded = false;
export async function hydrateProfiles(): Promise<void> {
	if (loaded || !browser) return;
	loaded = true;
	let list = await loadState<Profile[]>('profiles', []);
	if (!list.length) list = [defaultProfile()];
	profiles.set(list);
	activeProfileId.set(await loadState<string | null>('activeProfileId', list[0].id));
}

if (browser) {
	profiles.subscribe(($p) => { if (loaded) void saveState('profiles', $p); });
	activeProfileId.subscribe(($a) => { if (loaded) void saveState('activeProfileId', $a); });
}
