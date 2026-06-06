<script lang="ts">
	// Großes Banner zum Jahresrückblick (erscheint im Zeitraum bei jedem Start).
	// Kann „dieses Jahr nicht mehr" ausgeblendet werden (dann erst nächstes Jahr wieder).
	import { isReviewPeriod, reviewYear, isReviewDismissed, dismissReviewYear } from '$lib/yearReview';
	import { t } from '$lib/i18n';

	let { onOpenReview }: { onOpenReview: () => void } = $props();

	const year = reviewYear();
	let dismissed = $state(isReviewDismissed(year));
	let closedSession = $state(false);

	const show = $derived(isReviewPeriod() && !dismissed && !closedSession);

	function neverThisYear() {
		dismissReviewYear(year);
		dismissed = true;
	}
</script>

{#if show}
	<div class="yr-banner">
		<span class="yr-emoji">🎉</span>
		<div class="yr-text">
			<strong>{$t('review.bannerTitle', { year })}</strong>
			<span class="yr-sub">{$t('review.bannerSub')}</span>
		</div>
		<div class="yr-actions">
			<button class="yr-cta" onclick={onOpenReview}>{$t('review.open')}</button>
			<button class="yr-ghost" onclick={neverThisYear}>{$t('review.hideYear')}</button>
			<button class="yr-x" onclick={() => (closedSession = true)} aria-label={$t('common.close')}>×</button>
		</div>
	</div>
{/if}

<style>
	.yr-banner {
		display: flex; align-items: center; gap: 14px;
		padding: 13px 18px;
		background: linear-gradient(100deg, color-mix(in srgb, var(--accent) 32%, var(--bg-elev)), color-mix(in srgb, #b15cff 24%, var(--bg-elev)));
		border-bottom: 1px solid color-mix(in srgb, var(--accent) 45%, var(--border));
	}
	.yr-emoji { font-size: 28px; flex-shrink: 0; }
	.yr-text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
	.yr-text strong { font-size: 15px; font-weight: 800; }
	.yr-sub { font-size: 12.5px; color: var(--text-muted); }
	.yr-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
	.yr-cta { background: var(--accent); color: var(--accent-text); border: 0; font-weight: 700; font-size: 13px; padding: 9px 16px; border-radius: 10px; cursor: pointer; font-family: inherit; }
	.yr-cta:hover { filter: brightness(1.06); }
	.yr-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-muted); font-size: 12.5px; padding: 8px 12px; border-radius: 9px; cursor: pointer; font-family: inherit; }
	.yr-ghost:hover { color: var(--text); border-color: var(--border-strong); }
	.yr-x { background: transparent; border: 0; color: var(--text-muted); font-size: 22px; cursor: pointer; line-height: 1; padding: 0 4px; }
	.yr-x:hover { color: var(--text); }
</style>
