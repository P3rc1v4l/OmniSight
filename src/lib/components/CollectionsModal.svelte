<script lang="ts">
	import {
		collections,
		visibleProviders,
		addCollection,
		renameCollection,
		deleteCollection,
		toggleCollectionProvider
	} from '$lib/stores/providers';
	import { t } from '$lib/i18n';

	let { onClose }: { onClose: () => void } = $props();

	let newName = $state('');

	function create() {
		const n = newName.trim();
		if (!n) return;
		addCollection(n);
		newName = '';
	}
	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={onKey} />

<div class="overlay" onclick={onClose} role="presentation">
	<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
		<button class="close" onclick={onClose} aria-label={$t('common.close')}>✕</button>
		<h2>📁 {$t('col.title')}</h2>
		<p class="intro">{$t('col.intro')}</p>

		<div class="new">
			<input
				type="text"
				placeholder={$t('col.newPh')}
				bind:value={newName}
				onkeydown={(e) => e.key === 'Enter' && create()}
				maxlength="40"
			/>
			<button class="primary" onclick={create}>{$t('col.create')}</button>
		</div>

		{#if $collections.length === 0}
			<p class="empty">{$t('col.empty')}</p>
		{:else}
			<div class="list">
				{#each $collections as c (c.id)}
					<div class="col">
						<div class="col-head">
							<input
								class="name"
								type="text"
								value={c.name}
								oninput={(e) => renameCollection(c.id, e.currentTarget.value)}
								maxlength="40"
							/>
							<span class="count">{$t('col.count', { n: c.providerIds.length })}</span>
							<button class="del" onclick={() => deleteCollection(c.id)} title={$t('col.delete')} aria-label={$t('col.delete')}>🗑</button>
						</div>
						<div class="chips">
							{#each $visibleProviders as p (p.id)}
								<button
									class="chip"
									class:on={c.providerIds.includes(p.id)}
									style="--dot: {p.color}"
									onclick={() => toggleCollectionProvider(c.id, p.id)}
								>
									<span class="dot"></span>{p.name}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.overlay { position: fixed; inset: 0; z-index: 300; background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(4px); display: grid; place-items: center; padding: 24px; }
	.modal { position: relative; width: min(560px, 100%); max-height: 88vh; overflow-y: auto; background: var(--bg-card); border: 1px solid var(--border-strong); border-radius: 18px; padding: 24px; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5); }
	.close { position: absolute; top: 12px; right: 12px; width: 30px; height: 30px; border-radius: 8px; background: var(--bg-card-2); border: 1px solid var(--border); color: var(--text); cursor: pointer; }
	h2 { margin: 0 0 4px; font-size: 20px; }
	.intro { color: var(--text-muted); font-size: 13px; margin: 0 0 16px; }
	.new { display: flex; gap: 8px; margin-bottom: 18px; }
	.new input { flex: 1; padding: 9px 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-elev); color: var(--text); font-family: inherit; font-size: 14px; }
	.primary { background: var(--accent); color: var(--accent-text); border: 0; padding: 9px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; }
	.empty { color: var(--text-muted); text-align: center; padding: 20px 0; }
	.list { display: flex; flex-direction: column; gap: 14px; }
	.col { border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: color-mix(in srgb, var(--bg-elev) 60%, transparent); }
	.col-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
	.name { flex: 1; padding: 7px 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elev); color: var(--text); font-family: inherit; font-size: 14px; font-weight: 600; }
	.count { color: var(--text-muted); font-size: 12px; white-space: nowrap; }
	.del { background: transparent; border: 1px solid var(--border); color: var(--text); width: 32px; height: 32px; border-radius: 8px; cursor: pointer; }
	.del:hover { border-color: #e0556b; color: #e0556b; }
	.chips { display: flex; flex-wrap: wrap; gap: 6px; }
	.chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer; transition: border-color 0.12s ease, color 0.12s ease; }
	.chip:hover { border-color: var(--border-strong); }
	.chip.on { border-color: var(--accent); color: var(--text); background: color-mix(in srgb, var(--accent) 12%, transparent); }
	.chip .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--dot); }
</style>
