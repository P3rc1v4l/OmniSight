<script lang="ts">
	// Benachrichtigungs-Center: zeigt nur wichtige Hinweise (Achievements, Watchlist-Releases)
	// als In-App-Fenster. Kurze „Gespeichert"-Toasts landen hier bewusst NICHT.
	import { notifHistory, notifCenterOpen, clearNotifHistory } from '$lib/stores/toasts';
	import { t } from '$lib/i18n';

	function fmt(at?: number): string {
		if (!at) return '';
		const d = new Date(at);
		const now = new Date();
		const sameDay = d.toDateString() === now.toDateString();
		const hh = String(d.getHours()).padStart(2, '0');
		const mm = String(d.getMinutes()).padStart(2, '0');
		if (sameDay) return `${hh}:${mm}`;
		return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}. ${hh}:${mm}`;
	}
	function onKey(e: KeyboardEvent) {
		if ($notifCenterOpen && e.key === 'Escape') notifCenterOpen.set(false);
	}
</script>

<svelte:window onkeydown={onKey} />

{#if $notifCenterOpen}
	<div class="overlay" role="presentation" onclick={() => notifCenterOpen.set(false)}>
		<div
			class="center"
			role="dialog"
			aria-modal="true"
			aria-label={$t('notif.title')}
			onclick={(e) => e.stopPropagation()}
		>
			<div class="head">
				<span class="title">🔔 {$t('notif.title')}{#if $notifHistory.length}<span class="badge">{$notifHistory.length}</span>{/if}</span>
				<div class="head-actions">
					{#if $notifHistory.length}
						<button class="mini" onclick={clearNotifHistory}>{$t('notif.clear')}</button>
					{/if}
					<button class="x" onclick={() => notifCenterOpen.set(false)} aria-label={$t('common.close')}>×</button>
				</div>
			</div>
			<div class="body">
				{#if $notifHistory.length === 0}
					<div class="empty">
						<span class="empty-ic">🔕</span>
						<p class="empty-t">{$t('notif.empty')}</p>
						<p class="empty-h">{$t('notif.emptyHint')}</p>
					</div>
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
	</div>
{/if}

<style>
	.overlay { position: fixed; inset: 0; z-index: 950; background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(5px); display: grid; place-items: center; padding: 24px; }
	.center {
		width: min(500px, 96vw); max-height: 74vh;
		display: flex; flex-direction: column; overflow: hidden;
		background: var(--bg-elev); border: 1px solid var(--border); border-radius: 16px;
		box-shadow: 0 28px 70px -20px rgba(0, 0, 0, 0.8);
	}
	.head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); }
	.title { font-weight: 800; font-size: 17px; display: flex; align-items: center; gap: 9px; }
	.badge { font-size: 12px; font-weight: 700; color: var(--accent-text); background: var(--accent); border-radius: 999px; padding: 2px 9px; }
	.head-actions { display: flex; align-items: center; gap: 8px; }
	.mini { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); border-radius: 8px; padding: 5px 11px; font-size: 12.5px; cursor: pointer; font-family: inherit; }
	.mini:hover { border-color: var(--border-strong); color: var(--text); }
	.x { background: transparent; border: 0; color: var(--text-muted); font-size: 24px; cursor: pointer; line-height: 1; }
	.x:hover { color: var(--text); }
	.body { padding: 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
	.item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 13px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border); }
	.ic { font-size: 18px; width: 38px; height: 38px; flex-shrink: 0; display: grid; place-items: center; border-radius: 10px; background: var(--accent-soft); }
	.txt { flex: 1; min-width: 0; }
	.t { font-weight: 700; font-size: 13.5px; line-height: 1.3; }
	.b { color: var(--text-muted); font-size: 12.5px; margin-top: 2px; line-height: 1.35; }
	.time { color: var(--text-dim); font-size: 11px; flex-shrink: 0; white-space: nowrap; padding-top: 2px; }
	.empty { padding: 48px 24px; text-align: center; }
	.empty-ic { font-size: 44px; display: block; margin-bottom: 12px; opacity: 0.8; }
	.empty-t { font-weight: 700; font-size: 15px; margin: 0 0 4px; }
	.empty-h { color: var(--text-muted); font-size: 12.5px; margin: 0; line-height: 1.45; }
</style>
