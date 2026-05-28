<script lang="ts">
	import { page } from '$app/stores';
	import { activeStream } from '$lib/stores/providers';
	import { APP_NAME } from '$lib/version';

	// Navigationspunkte laut Doku (Teil 3).
	const nav = [
		{ href: '/', label: 'Übersicht', icon: '🏠' },
		{ href: '/watchlist', label: 'Watchlist', icon: '📌' },
		{ href: '/news', label: 'Neuigkeiten', icon: '📡' },
		{ href: '/upcoming', label: 'Upcoming', icon: '📅' },
		{ href: '/stream', label: 'Schaut gerade', icon: '▶️', onlyWhenStreaming: true },
		{ href: '/stats', label: 'Statistiken', icon: '📊' }
	];

	$: path = $page.url.pathname;
</script>

<aside class="sidebar" style="width: var(--sidebar-width)">
	<div class="brand">
		<span class="logo omni-accent">O</span>
		<span class="brand-name">{APP_NAME}</span>
	</div>

	<nav>
		{#each nav as item}
			{#if !item.onlyWhenStreaming || $activeStream}
				<a
					href={item.href}
					class="nav-item"
					class:active={path === item.href}
					aria-current={path === item.href ? 'page' : undefined}
				>
					<span class="nav-icon">{item.icon}</span>
					<span class="nav-label">{item.label}</span>
				</a>
			{/if}
		{/each}
	</nav>

	<div class="sidebar-footer">
		<a href="/settings" class="nav-item" class:active={path === '/settings'}>
			<span class="nav-icon">⚙️</span>
			<span class="nav-label">Einstellungen</span>
		</a>
	</div>
</aside>

<style>
	.sidebar {
		height: 100vh;
		flex-shrink: 0;
		background: var(--bg-elev);
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		padding: 16px 12px;
		box-sizing: border-box;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 8px 18px;
	}
	.logo {
		width: 32px;
		height: 32px;
		display: grid;
		place-items: center;
		border-radius: 9px;
		font-weight: 800;
		font-size: 18px;
	}
	.brand-name {
		font-weight: 700;
		letter-spacing: 0.2px;
	}
	nav {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
	}
	.nav-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		border-radius: calc(var(--radius) - 4px);
		color: var(--text-muted);
		text-decoration: none;
		transition: background 0.15s, color 0.15s;
	}
	.nav-item:hover {
		background: var(--bg-card);
		color: var(--text);
	}
	.nav-item.active {
		background: color-mix(in srgb, var(--accent) 18%, transparent);
		color: var(--text);
	}
	.nav-icon {
		font-size: 16px;
		width: 20px;
		text-align: center;
	}
	.sidebar-footer {
		margin-top: auto;
		padding-top: 8px;
		border-top: 1px solid var(--border);
	}
</style>
