<script lang="ts">
	import { APP_NAME } from '$lib/version';
	import { browser } from '$app/environment';

	export let onHelp: () => void;

	async function getWindow() {
		if (!browser) return null;
		try {
			const mod = await import('@tauri-apps/api/window');
			return mod.getCurrentWindow();
		} catch {
			return null;
		}
	}

	async function minimize() { (await getWindow())?.minimize(); }
	async function toggleMax() { (await getWindow())?.toggleMaximize(); }
	async function close() { (await getWindow())?.close(); }
</script>

<header class="titlebar" data-tauri-drag-region>
	<div class="brand" data-tauri-drag-region>
		<img class="mark" src="/logo.png" alt="" data-tauri-drag-region />
		<span class="name" data-tauri-drag-region>{APP_NAME}</span>
	</div>
	<div class="spacer" data-tauri-drag-region></div>
	<div class="actions">
		<button class="icon" title="Tastenkürzel anzeigen (F1)" aria-label="Hilfe" onclick={onHelp}>
			<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6">
				<circle cx="8" cy="8" r="6.4"/>
				<path d="M6.2 5.8c.2-1 1-1.6 2-1.6s1.9.7 1.9 1.7c0 1.5-1.9 1.5-1.9 2.6"/>
				<circle cx="8.1" cy="11.2" r=".55" fill="currentColor" stroke="none"/>
			</svg>
		</button>
		<button class="icon" title="Minimieren" aria-label="Minimieren" onclick={minimize}>
			<svg viewBox="0 0 12 12" width="12" height="12"><rect x="2" y="6" width="8" height="1.2" fill="currentColor"/></svg>
		</button>
		<button class="icon" title="Maximieren" aria-label="Maximieren" onclick={toggleMax}>
			<svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2.5" y="2.5" width="7" height="7"/></svg>
		</button>
		<button class="icon close" title="Schließen" aria-label="Schließen" onclick={close}>
			<svg viewBox="0 0 12 12" width="12" height="12" stroke="currentColor" stroke-width="1.4"><path d="M3 3 L9 9 M9 3 L3 9"/></svg>
		</button>
	</div>
</header>

<style>
	.titlebar {
		height: var(--titlebar-h);
		display: flex;
		align-items: center;
		background: var(--bg-elev);
		border-bottom: 1px solid var(--border);
		user-select: none;
		flex-shrink: 0;
	}
	.brand { display: flex; align-items: center; gap: 8px; padding: 0 12px; }
	.mark {
		width: 22px; height: 22px; border-radius: 6px;
		object-fit: contain; display: block;
	}
	.name { font-weight: 700; letter-spacing: 0.04em; font-size: 13px; }
	.spacer { flex: 1; height: 100%; }
	.actions { display: flex; height: 100%; }
	.icon {
		width: 46px; height: 100%;
		display: grid; place-items: center;
		background: transparent; border: 0; color: var(--text-muted);
		cursor: pointer; transition: background 0.12s, color 0.12s;
	}
	.icon:hover { background: var(--bg-card); color: var(--text); }
	.icon.close:hover { background: #e81123; color: #fff; }
</style>
