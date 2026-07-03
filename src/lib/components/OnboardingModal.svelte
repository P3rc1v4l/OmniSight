<script lang="ts">
	import { settings } from '$lib/stores/settings';
	import { profiles } from '$lib/stores/profiles';
	import { providers } from '$lib/stores/providers';
	import { setAutostart, applyCloseToTray } from '$lib/native';
	import { isTauri } from '$lib/platform';
	import { t } from '$lib/i18n';
	import type { Provider } from '$lib/types';

	let { open = false, close }: { open?: boolean; close: () => void } = $props();

	const LAST_STEP = 5;
	let step = $state(0);
	let profileName = $state('Profil 1');
	let providersList = $state<Provider[]>([]);
	$effect(() => { providersList = $providers; });
	// Beim Öffnen immer von vorn beginnen.
	$effect(() => { if (open) step = 0; });

	const accents = ['#30c5bb', '#ff5d3b', '#7c5cff', '#22c55e', '#f59e0b', '#ec4899'];

	function next() { step++; }
	function back() { if (step > 0) step--; }
	function finish() {
		profiles.update(($p) => {
			if ($p.length) $p[0].name = profileName.trim() || 'Profil 1';
			return $p;
		});
		providers.set(providersList);
		settings.update(($s) => ({ ...$s, onboardingDone: true }));
		close();
	}

	function toggleVisible(id: string) {
		providersList = providersList.map((p) => (p.id === id ? { ...p, hidden: !p.hidden } : p));
	}
	// Schnelleinstellungen mit nativen Nebenwirkungen direkt anwenden.
	function setTray(v: boolean) { $settings.plugins.closeToTray = v; void applyCloseToTray(v); }
	function setAuto(v: boolean) { $settings.plugins.autostart = v; void setAutostart(v); }
</script>

{#if open}
	<div class="backdrop" role="presentation">
		<div class="dialog omni-card" role="dialog" aria-modal="true">
			<header>
				<h2>{$t('ob.welcomeTitle')}</h2>
				<div class="dots">
					{#each Array(LAST_STEP + 1) as _, i}<span class:on={i <= step}></span>{/each}
				</div>
			</header>

			<div class="body">
				{#if step === 0}
					<img class="welcome-logo small" src="/logo.png" alt="OmniSight" />
					<p class="big">{$t('ob.langTitle')}</p>
					<div class="langs">
						<button class="lang" class:on={$settings.appearance.language === 'de'} onclick={() => ($settings.appearance.language = 'de')}>
							<span class="flag">🇩🇪</span> Deutsch
						</button>
						<button class="lang" class:on={$settings.appearance.language === 'en'} onclick={() => ($settings.appearance.language = 'en')}>
							<span class="flag">🇬🇧</span> English
						</button>
					</div>
					<small>{$t('ob.langHint')}</small>
				{:else if step === 1}
					<img class="welcome-logo" src="/logo.png" alt="OmniSight" />
					<p class="big">{$t('ob.tagline')}</p>
					<p>{$t('ob.intro')}</p>
				{:else if step === 2}
					<p class="big">{$t('ob.profileTitle')}</p>
					<input class="text" type="text" bind:value={profileName} placeholder={$t('ob.profilePh')} />
					<small>{$t('ob.profileHint')}</small>
				{:else if step === 3}
					<p class="big">{$t('ob.themeTitle')}</p>
					<div class="langs">
						<button class="lang" class:on={$settings.appearance.theme === 'dark'} onclick={() => ($settings.appearance.theme = 'dark')}>
							<span class="flag">🌙</span> {$t('ob.themeDark')}
						</button>
						<button class="lang" class:on={$settings.appearance.theme === 'light'} onclick={() => ($settings.appearance.theme = 'light')}>
							<span class="flag">☀️</span> {$t('ob.themeLight')}
						</button>
					</div>
					<p class="big sub">{$t('ob.accentTitle')}</p>
					<div class="swatches">
						{#each accents as c}
							<button
								class="sw"
								class:on={$settings.appearance.accentColor === c}
								style="background: {c}"
								onclick={() => ($settings.appearance.accentColor = c)}
								aria-label={c}
							></button>
						{/each}
					</div>
					<small>{$t('ob.accentHint')}</small>
				{:else if step === 4}
					<p class="big">{$t('ob.basicsTitle')}</p>
					<div class="opts">
						<label class="opt">
							<span class="ot">{$t('ob.optContinue')}</span>
							<input type="checkbox" checked={$settings.plugins.continueWatching} onchange={(e) => ($settings.plugins.continueWatching = e.currentTarget.checked)} />
						</label>
						{#if isTauri}
							<label class="opt">
								<span class="ot">{$t('ob.optTray')}</span>
								<input type="checkbox" checked={$settings.plugins.closeToTray} onchange={(e) => setTray(e.currentTarget.checked)} />
							</label>
							<label class="opt">
								<span class="ot">{$t('ob.optAutostart')}</span>
								<input type="checkbox" checked={$settings.plugins.autostart} onchange={(e) => setAuto(e.currentTarget.checked)} />
							</label>
						{/if}
					</div>
					<small>{$t('ob.basicsHint')}</small>
				{:else if step === 5}
					<p class="big">{$t('ob.provTitle')}</p>
					<div class="provs">
						{#each providersList as p (p.id)}
							<label class:off={p.hidden}>
								<input type="checkbox" checked={!p.hidden} onchange={() => toggleVisible(p.id)} />
								<span>{p.name}</span>
							</label>
						{/each}
					</div>
				{/if}
			</div>

			<footer>
				<button class="ghost" onclick={back} disabled={step === 0}>{$t('common.back')}</button>
				{#if step < LAST_STEP}
					<button class="primary" onclick={next}>{$t('common.next')}</button>
				{:else}
					<button class="primary" onclick={finish}>{$t('common.done')}</button>
				{/if}
			</footer>
		</div>
	</div>
{/if}

<style>
	.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.65); display: grid; place-items: center; z-index: 1100; }
	.dialog { width: min(640px, 92vw); max-height: 86vh; display: flex; flex-direction: column; background: var(--bg-elev); }
	header { padding: 20px 24px 4px; }
	h2 { margin: 0 0 12px; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
	.dots { display: flex; gap: 6px; }
	.dots span { width: 20px; height: 4px; border-radius: 99px; background: var(--border); }
	.dots span.on { background: var(--accent); }
	.body { padding: 18px 24px; overflow: auto; flex: 1; }
	.welcome-logo { width: 88px; height: 88px; display: block; margin: 4px 0 16px; }
	.welcome-logo.small { width: 56px; height: 56px; margin: 0 0 12px; }
	.big { font-size: 17px; font-weight: 600; margin: 0 0 8px; }
	.big.sub { margin-top: 22px; }
	.body p { color: var(--text-muted); line-height: 1.5; }
	.body small { color: var(--text-dim); display: block; margin-top: 10px; }
	.text {
		width: 100%; padding: 10px 14px; background: var(--bg-card);
		border: 1px solid var(--border); color: var(--text);
		border-radius: 10px; font-size: 15px; margin-top: 10px;
	}
	.swatches { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
	.langs { display: flex; gap: 12px; flex-wrap: wrap; margin: 14px 0 4px; }
	.lang { display: flex; align-items: center; gap: 10px; padding: 14px 20px; border-radius: 12px; background: var(--bg-card); border: 2px solid var(--border); color: var(--text); font-family: inherit; font-size: 15px; font-weight: 600; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
	.lang:hover { border-color: var(--border-strong); }
	.lang.on { border-color: var(--accent); background: var(--accent-soft); }
	.lang .flag { font-size: 22px; line-height: 1; }
	.sw { width: 36px; height: 36px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
	.sw.on { border-color: #fff; box-shadow: 0 0 0 2px var(--accent); }
	.opts { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
	.opt { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; cursor: pointer; }
	.ot { font-size: 14px; font-weight: 600; }
	.opt input { width: 18px; height: 18px; accent-color: var(--accent); cursor: pointer; }
	.provs { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 6px; margin-top: 10px; max-height: 280px; overflow: auto; padding-right: 4px; }
	.provs label { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: var(--bg-card); border-radius: 8px; font-size: 13px; cursor: pointer; border: 1px solid var(--border); }
	.provs label.off { opacity: 0.55; }
	footer { display: flex; justify-content: space-between; gap: 12px; padding: 16px 24px 22px; border-top: 1px solid var(--border); }
	.ghost { background: var(--bg-card); border: 1px solid var(--border); color: var(--text); padding: 10px 16px; border-radius: 10px; cursor: pointer; }
	.ghost:disabled { opacity: 0.4; cursor: not-allowed; }
	.primary { background: var(--accent); color: var(--accent-text); border: 0; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; }
</style>
