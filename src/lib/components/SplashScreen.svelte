<script lang="ts">
	// Splash-Screen beim App-Start: Wortmarke mit Glow + Fortschrittsbalken.
	// Wird vom Layout mit echtem Lade-Fortschritt gefüttert und blendet sich
	// nach Abschluss weich aus (danach komplett aus dem DOM entfernt).
	import { t } from '$lib/i18n';
	import { APP_VERSION } from '$lib/version';

	let { progress = 0, label = '', done = false }: { progress?: number; label?: string; done?: boolean } = $props();
</script>

<div class="splash" class:out={done} aria-hidden={done}>
	<div class="glow-bg"></div>
	<div class="center">
		<div class="wordmark" aria-label="OmniSight">
			<span class="wm">Omni<span class="wm-accent">Sight</span></span>
			<span class="shine" aria-hidden="true"></span>
		</div>
		<div class="bar" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100">
			<div class="fill" style="width: {progress}%"></div>
		</div>
		<div class="status">{label || $t('splash.start')}</div>
	</div>
	<div class="version">v{APP_VERSION}</div>
</div>

<style>
	.splash {
		position: fixed;
		inset: 0;
		z-index: 1400;
		display: grid;
		place-items: center;
		background: radial-gradient(120% 90% at 50% 10%, #10131a 0%, #0b0c10 55%, #07080b 100%);
		transition: opacity var(--dur-slow) var(--ease-out), visibility var(--dur-slow);
	}
	.splash.out { opacity: 0; visibility: hidden; pointer-events: none; }

	/* Sanfter Akzent-Schein hinter der Wortmarke. */
	.glow-bg {
		position: absolute;
		width: 560px;
		height: 560px;
		border-radius: 50%;
		background: radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 62%);
		filter: blur(10px);
		animation: breathe 3.2s ease-in-out infinite;
	}
	@keyframes breathe {
		0%, 100% { transform: scale(1); opacity: 0.8; }
		50% { transform: scale(1.08); opacity: 1; }
	}

	.center { position: relative; display: flex; flex-direction: column; align-items: center; gap: 22px; }

	.wordmark { position: relative; overflow: hidden; padding: 4px 10px; }
	.wm {
		font-size: 44px;
		font-weight: 800;
		letter-spacing: 0.5px;
		color: var(--text);
		text-shadow: 0 0 30px color-mix(in srgb, var(--accent) 35%, transparent);
	}
	.wm-accent {
		color: var(--accent);
		text-shadow: 0 0 26px color-mix(in srgb, var(--accent) 65%, transparent);
	}
	/* Shine-Sweep: ein Lichtstreifen wandert über die Wortmarke. */
	.shine {
		position: absolute;
		inset: 0;
		background: linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.16) 50%, transparent 60%);
		transform: translateX(-120%);
		animation: sweep 2.4s var(--ease-out) infinite;
	}
	@keyframes sweep {
		0% { transform: translateX(-120%); }
		55%, 100% { transform: translateX(120%); }
	}

	.bar {
		width: 260px;
		height: 5px;
		border-radius: 99px;
		background: rgba(255, 255, 255, 0.08);
		overflow: hidden;
	}
	.fill {
		height: 100%;
		border-radius: 99px;
		background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 70%, #fff 0%), var(--accent));
		box-shadow: 0 0 14px color-mix(in srgb, var(--accent) 80%, transparent);
		transition: width var(--dur-med) var(--ease-out);
	}

	.status { font-size: 12.5px; color: var(--text-muted); letter-spacing: 0.04em; min-height: 1em; }
	.version { position: absolute; bottom: 18px; font-size: 11px; color: var(--text-dim); }
</style>
