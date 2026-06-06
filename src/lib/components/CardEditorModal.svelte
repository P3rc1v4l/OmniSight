<script lang="ts">
	import { editingProvider, updateProvider, resetProviderToDefault, toggleProviderHidden } from '$lib/stores/providers';
	import { pushToast } from '$lib/stores/toasts';
	import Logo from './Logo.svelte';
	import type { Quality, Provider } from '$lib/types';

	let id = $state<string | null>(null);
	let name = $state('');
	let subtitle = $state('');
	let url = $state('');
	let color = $state('#30c5bb');
	let color2 = $state('');
	let quality = $state<Quality>('HD');
	let icon = $state<string | undefined>(undefined);
	let isCustom = $state(false);
	let adblock = $state(false);
	let lastId: string | null = null;

	// Beim Öffnen einer Karte die Felder einmalig befüllen.
	$effect(() => {
		const p = $editingProvider;
		if (p && p.id !== lastId) {
			lastId = p.id;
			id = p.id;
			name = p.name;
			subtitle = p.subtitle;
			url = p.url;
			color = p.color;
			color2 = p.color2 ?? '';
			quality = p.quality;
			icon = p.icon;
			isCustom = !!p.custom;
			adblock = !!p.adblock;
		}
		if (!p) lastId = null;
	});

	// Live-Vorschau des Logos aus den aktuellen Eingaben.
	const previewProvider = $derived({
		id: id ?? 'preview',
		name: name || 'Anbieter',
		subtitle,
		url,
		category: 'eigene',
		color: color || '#30c5bb',
		color2: color2 || undefined,
		quality,
		icon: icon || undefined
	} as Provider);

	function onLogoFile(e: Event) {
		const f = (e.target as HTMLInputElement).files?.[0];
		if (!f) return;
		const reader = new FileReader();
		reader.onload = () => (icon = reader.result as string);
		reader.readAsDataURL(f);
	}
	function clearLogo() { icon = undefined; }

	function save() {
		if (!id) return;
		let u = url.trim();
		if (u && !/^https?:\/\//i.test(u)) u = `https://${u}`;
		updateProvider(id, {
			name: name.trim() || 'Anbieter',
			subtitle: subtitle.trim(),
			url: u,
			color: color || '#30c5bb',
			color2: color2.trim() || undefined,
			colorManual: true,
			quality,
			icon: icon || undefined,
			adblock
		});
		pushToast('Karte gespeichert', name.trim(), '✏️', 2200);
		editingProvider.set(null);
	}
	function cancel() { editingProvider.set(null); }
	function resetCard() {
		if (!id) return;
		if (!confirm('Diese Karte wieder auf den Standard zurücksetzen?')) return;
		resetProviderToDefault(id);
		pushToast('Karte zurückgesetzt', undefined, '↩️', 2000);
		editingProvider.set(null);
	}
	function hideCard() {
		if (!id) return;
		toggleProviderHidden(id);
		pushToast('Anbieter ausgeblendet', 'Unten auf der Startseite kannst du ihn wieder einblenden.', '🙈', 2600);
		editingProvider.set(null);
	}
	function onBackdrop(e: MouseEvent) { if (e.target === e.currentTarget) cancel(); }
</script>

{#if $editingProvider}
	<div class="backdrop" onclick={onBackdrop} role="presentation">
		<div class="modal omni-card">
			<header>
				<h2>Karte bearbeiten</h2>
				<div class="head-actions">
					<button class="head-hide" onclick={hideCard} title="Anbieter ausblenden">🙈 Ausblenden</button>
					<button class="x" onclick={cancel} aria-label="Schließen">×</button>
				</div>
			</header>

			<div class="preview">
				<Logo provider={previewProvider} size={64} />
				<div class="pv-meta">
					<div class="pv-name">{name || 'Anbieter'}</div>
					<div class="pv-sub">{subtitle || '—'}</div>
				</div>
			</div>

			<div class="body">
				<label class="f"><span>Name</span>
					<input type="text" bind:value={name} placeholder="z. B. Netflix" />
				</label>
				<label class="f"><span>Untertitel</span>
					<input type="text" bind:value={subtitle} placeholder="z. B. Filme & Serien" />
				</label>
				<label class="f"><span>URL</span>
					<input type="text" bind:value={url} placeholder="https://…" />
				</label>
				<div class="row2">
					<label class="f"><span>Farbe</span>
						<div class="crow">
							<input type="color" bind:value={color} />
							<input type="text" class="hex" bind:value={color} />
						</div>
					</label>
					<label class="f"><span>2. Farbe (Verlauf, optional)</span>
						<div class="crow">
							<input type="color" value={color2 || color} oninput={(e) => (color2 = (e.target as HTMLInputElement).value)} />
							{#if color2}<button class="mini" onclick={() => (color2 = '')}>aus</button>{/if}
						</div>
					</label>
				</div>
				<label class="f"><span>Qualität</span>
					<select bind:value={quality}>
						<option value="4K">4K</option>
						<option value="1080p">1080p</option>
						<option value="HD">HD</option>
						<option value="SD">SD</option>
					</select>
				</label>
				<label class="f"><span>Werbeblocker (nur Windows)</span>
					<div class="crow">
						<input type="checkbox" bind:checked={adblock} />
						<span class="hint" style="margin:0">Öffnet diesen Anbieter in einem <strong>eigenen Fenster</strong> mit Werbeblocker-Erweiterung (uBlock) und eigenem Login pro Profil. Nur Windows.</span>
					</div>
				</label>
				<div class="f">
					<span>Logo</span>
					<div class="logo-actions">
						<label class="filebtn">
							Bild wählen
							<input type="file" accept="image/*" onchange={onLogoFile} hidden />
						</label>
						{#if icon}
							<button class="ghost" onclick={clearLogo}>Buchstaben-Logo nutzen</button>
						{/if}
					</div>
					<p class="hint">Ohne eigenes Bild wird automatisch ein farbiges Buchstaben-Logo erzeugt.</p>
				</div>
			</div>

			<footer>
				{#if !isCustom}
					<button class="ghost danger" onclick={resetCard}>Zurücksetzen</button>
				{/if}
				<span class="spacer"></span>
				<button class="ghost" onclick={cancel}>Abbrechen</button>
				<button class="primary" onclick={save}>Speichern</button>
			</footer>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed; inset: 0; z-index: 250;
		background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(3px);
		display: grid; place-items: center; padding: 20px;
	}
	.modal {
		width: 460px; max-width: 100%; max-height: 90vh; overflow-y: auto;
		background: var(--bg-elev); border: 1px solid var(--border);
		border-radius: 16px; box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.7);
	}
	header { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid var(--border); }
	.head-actions { display: flex; align-items: center; gap: 8px; }
	.head-hide { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); padding: 5px 11px; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 12.5px; white-space: nowrap; }
	.head-hide:hover { border-color: var(--border-strong); color: var(--text); }
	header h2 { margin: 0; font-size: 17px; font-weight: 800; }
	.x { background: transparent; border: 0; color: var(--text-muted); font-size: 24px; cursor: pointer; line-height: 1; }
	.preview { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border-bottom: 1px solid var(--border); }
	.pv-name { font-weight: 800; font-size: 15px; }
	.pv-sub { color: var(--text-muted); font-size: 12.5px; }
	.body { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
	.f { display: flex; flex-direction: column; gap: 6px; }
	.f > span { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); }
	.f input[type='text'], .f select, .hex { background: var(--bg-card); border: 1px solid var(--border); color: var(--text); border-radius: 9px; padding: 9px 12px; font-size: 14px; font-family: inherit; }
	.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
	.crow { display: flex; gap: 8px; align-items: center; }
	.crow input[type='color'] { width: 44px; height: 38px; padding: 2px; border: 1px solid var(--border); border-radius: 9px; background: transparent; cursor: pointer; }
	.hex { flex: 1; min-width: 0; }
	.logo-actions { display: flex; gap: 8px; flex-wrap: wrap; }
	.filebtn { background: var(--bg-card); border: 1px solid var(--border); color: var(--text); padding: 9px 14px; border-radius: 9px; cursor: pointer; font-size: 13.5px; display: inline-block; font-family: inherit; }
	.filebtn:hover { border-color: var(--border-strong); }
	.mini { background: var(--bg-card); border: 1px solid var(--border); color: var(--text); padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 12px; font-family: inherit; }
	.hint { color: var(--text-muted); font-size: 12px; margin: 0; }
	footer { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 14px 18px; border-top: 1px solid var(--border); }
	.spacer { flex: 1; }
	.ghost { background: var(--bg-card); border: 1px solid var(--border); color: var(--text); padding: 9px 16px; border-radius: 10px; cursor: pointer; font-family: inherit; font-size: 13.5px; }
	.ghost:hover { border-color: var(--border-strong); }
	.ghost.danger { color: #f87171; border-color: color-mix(in srgb, #f87171 40%, var(--border)); }
	.primary { background: var(--accent); color: var(--accent-text); border: 0; padding: 9px 18px; border-radius: 10px; cursor: pointer; font-weight: 700; font-family: inherit; font-size: 13.5px; }
</style>
