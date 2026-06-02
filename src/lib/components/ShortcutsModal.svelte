<script lang="ts">
	export let open: boolean = false;
	export let close: () => void;

	const shortcuts = [
		{ keys: ['F1'], desc: 'Diese Tastenkürzel-Übersicht öffnen' },
		{ keys: ['?'], desc: 'Diese Übersicht öffnen (alternativ)' },
		{ keys: ['1–9'], desc: 'Favorit 1–9 direkt starten' },
		{ keys: ['Strg', 'K'], desc: 'Suche fokussieren' },
		{ keys: ['Strg', ','], desc: 'Einstellungen öffnen' },
		{ keys: ['Strg', 'D'], desc: 'Hell-/Dunkel-Modus wechseln' },
		{ keys: ['Esc'], desc: 'Vollbild verlassen / Dialog schließen' },
		{ keys: ['Enter'], desc: 'Markierten Anbieter / Treffer öffnen' }
	];

	function onBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) close();
	}
</script>

{#if open}
	<div class="backdrop" onclick={onBackdrop} role="presentation">
		<div class="dialog omni-card" role="dialog" aria-modal="true" aria-label="Tastenkürzel">
			<header>
				<h2>Tastenkürzel</h2>
				<button class="x" onclick={close} aria-label="Schließen">×</button>
			</header>
			<ul>
				{#each shortcuts as s}
					<li>
						<span class="desc">{s.desc}</span>
						<span class="keys">
							{#each s.keys as k, i}
								<kbd>{k}</kbd>{#if i < s.keys.length - 1}<span class="plus">+</span>{/if}
							{/each}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed; inset: 0; background: rgba(0,0,0,0.6);
		display: grid; place-items: center; z-index: 100;
	}
	.dialog {
		width: min(520px, 92vw);
		max-height: 80vh; overflow: auto;
		background: var(--bg-elev);
	}
	header { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; border-bottom: 1px solid var(--border); }
	h2 { margin: 0; font-size: 18px; font-weight: 700; }
	.x { background: transparent; border: 0; color: var(--text-muted); font-size: 24px; cursor: pointer; line-height: 1; }
	ul { list-style: none; padding: 8px 0; margin: 0; }
	li {
		display: flex; justify-content: space-between; align-items: center;
		padding: 12px 22px; gap: 16px;
	}
	.desc { color: var(--text); }
	.keys { display: flex; align-items: center; gap: 4px; }
	kbd {
		background: var(--bg-card); border: 1px solid var(--border-strong);
		padding: 3px 8px; border-radius: 6px;
		font-family: 'DM Sans', system-ui; font-size: 11.5px; font-weight: 600;
		color: var(--text-muted);
	}
	.plus { color: var(--text-dim); font-size: 11px; }
</style>
