<script lang="ts">
	import { toasts, dismissToast } from '$lib/stores/toasts';
	import { toastIcon } from '$lib/toastIcons';
</script>

<div class="toast-wrap" aria-live="polite">
	{#each $toasts as t (t.id)}
		{@const Ico = toastIcon(t.icon)}
		<div class="toast omni-card">
			<span class="icon">{#if Ico}<Ico size={17} />{:else}{t.icon}{/if}</span>
			<div class="content">
				<div class="title">{t.title}</div>
				{#if t.body}<div class="body">{t.body}</div>{/if}
			</div>
			<button class="x" onclick={() => dismissToast(t.id)} aria-label="Schließen">×</button>
		</div>
	{/each}
</div>

<style>
	.toast-wrap {
		position: fixed; right: 18px; bottom: 18px; z-index: 200;
		display: flex; flex-direction: column; gap: 10px;
		max-width: 360px;
	}
	.toast {
		display: flex; align-items: flex-start; gap: 10px;
		background: var(--bg-elev); padding: 12px 14px;
		box-shadow: 0 12px 30px -8px rgba(0,0,0,0.55);
		border-left: 3px solid var(--accent);
		animation: slidein 0.22s ease;
	}
	@keyframes slidein { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }
	.icon { font-size: 18px; line-height: 1.2; display: inline-flex; align-items: center; color: var(--accent); padding-top: 1px; }
	.content { flex: 1; min-width: 0; }
	.title { font-weight: 700; font-size: 13.5px; }
	.body { color: var(--text-muted); font-size: 12.5px; margin-top: 2px; }
	.x { background: transparent; border: 0; color: var(--text-muted); font-size: 20px; cursor: pointer; line-height: 1; }
	.x:hover { color: var(--text); }
</style>
