// Backup/Restore: sichert ALLE App-Daten (Plugin-Store + localStorage) in eine
// JSON-Datei und stellt sie daraus wieder her. Bewusst generisch, damit neue
// Funktionen/Schlüssel automatisch mitgesichert werden.
import { browser } from '$app/environment';
import { APP_VERSION } from '$lib/version';
import { exportStore, importStore } from '$lib/persistence';

const BACKUP_TYPE = 'omnisight-backup';

export interface BackupFile {
	app: 'OmniSight';
	type: typeof BACKUP_TYPE;
	version: string;
	exportedAt: string;
	store: Record<string, unknown>;
	local: Record<string, string>;
}

function collectLocal(): Record<string, string> {
	const local: Record<string, string> = {};
	if (!browser || typeof localStorage === 'undefined') return local;
	for (let i = 0; i < localStorage.length; i++) {
		const k = localStorage.key(i);
		if (k != null) local[k] = localStorage.getItem(k) ?? '';
	}
	return local;
}

// Backup-Objekt zusammenstellen.
export async function buildBackup(): Promise<BackupFile> {
	const store = await exportStore();
	return {
		app: 'OmniSight',
		type: BACKUP_TYPE,
		version: APP_VERSION,
		exportedAt: new Date().toISOString(),
		store,
		local: collectLocal()
	};
}

// Backup als Datei herunterladen.
export async function downloadBackup(): Promise<void> {
	if (!browser) return;
	const payload = await buildBackup();
	const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `omnisight-backup-${new Date().toISOString().slice(0, 10)}.json`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Backup-Text prüfen und (kurz) zusammenfassen – ohne etwas zu ändern.
export function parseBackup(text: string): BackupFile {
	const data = JSON.parse(text) as BackupFile;
	if (!data || (data.type !== BACKUP_TYPE && data.type !== 'omnihub-backup') || typeof data.store !== 'object' || data.store === null) {
		throw new Error('Keine gültige OmniSight-Sicherung.');
	}
	return data;
}

// Backup anwenden (überschreibt aktuelle Daten). Danach sollte die App neu geladen werden.
export async function applyBackup(data: BackupFile): Promise<void> {
	await importStore(data.store);
	if (browser && data.local && typeof data.local === 'object') {
		for (const [k, v] of Object.entries(data.local)) {
			try {
				localStorage.setItem(k, String(v));
			} catch {
				/* ignore */
			}
		}
	}
}
