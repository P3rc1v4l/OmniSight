<script lang="ts">
	import { visibleProviders, activeStream } from '$lib/stores/providers';
	import { goto } from '$app/navigation';
	import type { Provider } from '$lib/types';

	let search = $state('');

	// Einfache Client-Filterung nach Name (TMDB-Titelsuche kommt in v0.2).
	const filtered = $derived(
		$visibleProviders.filter((p) =>
			p.name.toLowerCase().includes(search.trim().toLowerCase())
		)
	);

	function openProvider(p: Provider) {
		activeStream.set(p);
		goto('/stream');
	}

	function initials(name: string) {
		return name.replace(/[^A-Za-z0-9 ]/g, '').slice(0, 2).toUpperCase();
	}
</script>

<div class="page">
	<header class="head">
		<div>
			<h1>Übersicht</h1>
			<p class="sub">Alle deine Dienste an einem Ort.</p>
		</div>
		<div class="search">
			<span class="search-icon">🔎</span>
			<input
				type="text"
				placeholder="Anbieter suchen … (Titelsuche folgt)"
				bind:value={search}
			/>
		</div>
	</header>

	<section class="grid" aria-label="Streaming-Anbieter">
		{#each filtered as p (p.id)}
			<button class="card omni-card" onclick={() => openProvider(p)} title={`${p.name} öffnen`}>
				<div class="logo" style={`background:${p.color}`}>
					{#if p.icon}
						<img src={p.icon} alt="" />
					{:else}
						<span>{initials(p.name)}</span>
					{/if}
				</div>
				<span class="name">{p.name}</span>

				<!-- Karteneditor-Button taucht beim Hovern auf (laut Doku). -->
				<span
					class="edit"
					role="button"
					tabindex="0"
					title="Karte bearbeiten"
					onclick={(e) => { e.stopPropagation(); /* Karteneditor folgt in v0.3 */ }}
					onkeydown={(e) => { if (e.key === 'Enter') e.stopPropagation(); }}
				>✎</span>
			</button>
		{/each}

		<!-- Eigener-Anbieter-Platzhalter -->
		<button class="card add omni-card" title="Eigenen Anbieter hinzufügen">
			<div class="plus">＋</div>
			<span class="name">Eigener Anbieter</span>
		</button>
	</section>
</div>

<style>
	.page {
		padding: 28px 32px;
		max-width: 1400px;
	}
	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 16px;
		margin-bottom: 24px;
		flex-wrap: wrap;
	}
	h1 {
		margin: 0;
		font-size: 28px;
		font-weight: 800;
		letter-spacing: -0.5px;
	}
	.sub {
		margin: 4px 0 0;
		color: var(--text-muted);
	}
	.search {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 8px 14px;
		min-width: 280px;
	}
	.search input {
		background: transparent;
		border: none;
		outline: none;
		color: var(--text);
		width: 100%;
		font-size: 14px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 16px;
	}
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 20px 12px;
		cursor: pointer;
		color: var(--text);
		transition: transform 0.15s, border-color 0.15s;
	}
	.card:hover {
		transform: translateY(-3px);
		border-color: color-mix(in srgb, var(--accent) 60%, var(--border));
	}
	.logo {
		width: 64px;
		height: 64px;
		border-radius: 14px;
		display: grid;
		place-items: center;
		color: #fff;
		font-weight: 800;
		font-size: 20px;
		overflow: hidden;
	}
	.logo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.name {
		font-size: 14px;
		font-weight: 600;
		text-align: center;
	}
	.edit {
		position: absolute;
		top: 8px;
		right: 8px;
		opacity: 0;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: 8px;
		width: 26px;
		height: 26px;
		display: grid;
		place-items: center;
		font-size: 13px;
		transition: opacity 0.15s;
	}
	.card:hover .edit {
		opacity: 1;
	}
	.add {
		border-style: dashed;
		color: var(--text-muted);
	}
	.plus {
		font-size: 36px;
		line-height: 1;
		color: var(--accent);
	}
</style>
