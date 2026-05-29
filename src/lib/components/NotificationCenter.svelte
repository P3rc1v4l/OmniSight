<script lang="ts">
	import { notifHistory, notifCenterOpen, clearNotifHistory } from '$lib/stores/toasts';

	function fmt(at?: number): string {
		if (!at) return '';
		const d = new Date(at);
		return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
	}
</script>

{#if $notifCenterOpen}
	<button class="scrim" aria-label="Schließen" onclick={() => notifCenterOpen.set(false)}></button>
	<div class="center omni-card">
		<div class="head">
			<span class="title">🔔 Benachrichtigungen</span>
			<div class="head-actions">
				{#if $notifHistory.length}
					<button class="mini" onclick={clearNotifHistory}>Leeren</button>
				{/if}
				<button class="mini" onclick={() => notifCenterOpen.set(false)} aria-label="Schließen">✕</button>
			</div>
		</div>
		<div class="body">
			{#if $notifHistory.length === 0}
				<p class="empty">Keine Benachrichtigungen.</p>
			{:else}
				{#each $notifHistory as n (n.id)}
					<div class="item">
						<span class="ic">{n.icon ?? '🔔'}</span>
						<div class="txt">
							<div class="t">{n.title}</div>
							{#if n.body}<div class="b">{n.body}</div>{/if}
						</div>
						<span class="time">{fmt(n.at)}</span>
					</div>
				{/each}
			{/if}
		</div>
	</div>
{/if}

<style>
	.scrim { position: fixed; inset: 0; background: transparent; border: 0; z-index: 190; cursor: default; }
	.center {
		position: fixed;
		left: calc(var(--sidebar-width) + 12px);
		bottom: 16px;
		width: 320px; max-height: 60vh;
		z-index: 200;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.6);
		display: flex; flex-direction: column; overflow: hidden;
	}
	.head {
		display: flex; align-items: center; justify-content: space-between;
		padding: 12px 14px; border-bottom: 1px solid var(--border);
	}
	.title { font-weight: 700; font-size: 14px; }
	.head-actions { display: flex; gap: 6px; }
	.mini {
		background: var(--bg-card); border: 1px solid var(--border); color: var(--text);
		padding: 4px 9px; border-radius: 8px; cursor: pointer; font-size: 12px; font-family: inherit;
	}
	.mini:hover { border-color: var(--border-strong); }
	.body { overflow-y: auto; padding: 6px; }
	.empty { color: var(--text-muted); font-size: 13px; padding: 18px; text-align: center; }
	.item { display: flex; gap: 10px; align-items: flex-start; padding: 9px 8px; border-radius: 9px; }
	.item:hover { background: var(--bg-card); }
	.ic { font-size: 16px; line-height: 1.3; }
	.txt { flex: 1; min-width: 0; }
	.t { font-weight: 600; font-size: 13px; }
	.b { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
	.time { font-size: 11px; color: var(--text-dim); white-space: nowrap; }
</style>
