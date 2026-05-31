<script lang="ts">
	import { backgroundStreams, bringToForeground, closeBackgroundStream, setBackgroundMuted, immersive } from '$lib/embedded';
	import Logo from '$lib/components/Logo.svelte';
</script>

{#if $backgroundStreams.length}
	<div class="tray" class:imm={$immersive}>
		<div class="tray-head">Im Hintergrund · {$backgroundStreams.length}</div>
		{#each $backgroundStreams as s (s.streamId)}
			<div class="pill" class:muted={s.muted}>
				<Logo provider={s.provider} size={18} />
				<span class="nm" title={s.provider.name}>{s.provider.name}</span>
				<button
					class="ic"
					onclick={() => setBackgroundMuted(s.streamId, !s.muted)}
					title={s.muted ? 'Ton einschalten' : 'Stummschalten'}
					aria-label={s.muted ? 'Ton einschalten' : 'Stummschalten'}
				>{s.muted ? '🔇' : '🔊'}</button>
				<button class="ic" onclick={() => bringToForeground(s.streamId)} title="In den Vordergrund holen" aria-label="In den Vordergrund holen">▶</button>
				<button class="ic close" onclick={() => closeBackgroundStream(s.streamId)} title="Stream schließen" aria-label="Stream schließen">✕</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	.tray { position: fixed; left: calc(var(--sidebar-width) + 16px); bottom: 16px; z-index: 70; display: flex; flex-direction: column; gap: 7px; max-width: 320px; }
	.tray.imm { left: 16px; }
	.tray-head { font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); padding-left: 4px; }
	.pill { display: flex; align-items: center; gap: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 6px 8px 6px 10px; box-shadow: 0 10px 26px -14px rgba(0, 0, 0, 0.7); }
	.pill.muted { opacity: 0.78; }
	.nm { font-size: 12.5px; font-weight: 600; max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.ic { background: var(--bg-elev); border: 1px solid var(--border); border-radius: 8px; width: 28px; height: 28px; display: grid; place-items: center; cursor: pointer; font-size: 13px; line-height: 1; transition: border-color 0.14s, background 0.14s, color 0.14s; flex-shrink: 0; }
	.ic:hover { border-color: var(--border-strong); }
	.ic.close:hover { background: rgba(220, 45, 45, 0.85); border-color: transparent; color: #fff; }
</style>
