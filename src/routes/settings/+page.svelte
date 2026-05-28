<script lang="ts">
	import { settings } from '$lib/stores/settings';
	import { resetProviders } from '$lib/stores/providers';
	import { LINKS } from '$lib/version';

	const tabs = [
		{ id: 'appearance', label: '🎨 Design' },
		{ id: 'account', label: '🔑 Account' },
		{ id: 'clock', label: '🕐 Uhr' },
		{ id: 'notifications', label: '🔔 Benachrichtigungen' },
		{ id: 'plugins', label: '🧩 Plugins' },
		{ id: 'advanced', label: '⚙️ Mehr' }
	];
	let active = $state('appearance');
</script>

<div class="page">
	<h1>Einstellungen</h1>

	<div class="tabs">
		{#each tabs as t}
			<button class:active={active === t.id} onclick={() => (active = t.id)}>{t.label}</button>
		{/each}
	</div>

	<div class="panel omni-card">
		{#if active === 'appearance'}
			<label class="row">
				<span>Akzentfarbe</span>
				<input type="color" bind:value={$settings.appearance.accentColor} />
			</label>
			<label class="row">
				<span>Erscheinungsbild</span>
				<select bind:value={$settings.appearance.theme}>
					<option value="dark">Dark</option>
					<option value="light">Light</option>
					<option value="system">System</option>
				</select>
			</label>
			<label class="row">
				<span>Schriftgröße: {$settings.appearance.fontSize}px</span>
				<input type="range" min="12" max="22" bind:value={$settings.appearance.fontSize} />
			</label>
			<label class="row">
				<span>Eckenradius: {$settings.appearance.radius}px</span>
				<input type="range" min="0" max="28" bind:value={$settings.appearance.radius} />
			</label>
			<label class="row">
				<span>Sidebar-Breite: {$settings.appearance.sidebarWidth}px</span>
				<input type="range" min="160" max="320" bind:value={$settings.appearance.sidebarWidth} />
			</label>
		{:else if active === 'advanced'}
			<button class="action" onclick={resetProviders}>Anbieterkarten zurücksetzen</button>
			<a class="action link" href={LINKS.discord} target="_blank" rel="noreferrer">Discord – Feedback & Support</a>
			<a class="action link" href={LINKS.githubReleases} target="_blank" rel="noreferrer">Nach Updates suchen (GitHub Releases)</a>
			<p class="hint">VPN, Watchlist-Import/Export, WideVine-Status & Onboarding-Neustart folgen in späteren Versionen.</p>
		{:else}
			<p class="hint">Dieser Tab wird in einer kommenden Version ausgebaut.</p>
		{/if}
	</div>
</div>

<style>
	.page { padding: 28px 32px; max-width: 760px; }
	h1 { margin: 0 0 20px; font-size: 28px; font-weight: 800; }
	.tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
	.tabs button {
		background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted);
		padding: 8px 14px; border-radius: 999px; cursor: pointer; font-size: 13px;
	}
	.tabs button.active { background: color-mix(in srgb, var(--accent) 18%, transparent); color: var(--text); border-color: var(--accent); }
	.panel { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
	.row { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
	.row span { color: var(--text-muted); }
	input[type='range'] { width: 200px; }
	.action {
		display: inline-block; background: var(--bg-elev); border: 1px solid var(--border);
		color: var(--text); padding: 10px 14px; border-radius: 10px; cursor: pointer; text-decoration: none;
	}
	.action.link { color: var(--accent); }
	.hint { color: var(--text-muted); font-size: 13px; }
</style>
