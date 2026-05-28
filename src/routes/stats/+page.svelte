<div class="page">
	<h1>Statistiken</h1>
	<p class="sub">Streamzeit pro Anbieter, Gesamtzeit, Wochentag-Aufschlüsselung & Achievements.</p>

	<div class="cards">
		<div class="stat omni-card"><span class="big">0 h</span><span>Gesamtzeit</span></div>
		<div class="stat omni-card"><span class="big">0</span><span>Anbieter genutzt</span></div>
		<div class="stat omni-card"><span class="big">0 / 50</span><span>Achievements</span></div>
	</div>

	<div class="empty omni-card">
		<span class="emoji">📊</span>
		<p>Streamzeit-Tracking startet, sobald ein Stream läuft (ab v0.2).</p>
	</div>
</div>

<style>
	.page { padding: 28px 32px; }
	h1 { margin: 0; font-size: 28px; font-weight: 800; }
	.sub { color: var(--text-muted); margin: 4px 0 24px; }
	.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
	.stat { padding: 20px; display: flex; flex-direction: column; gap: 6px; }
	.big { font-size: 26px; font-weight: 800; color: var(--accent); }
	.stat span:last-child { color: var(--text-muted); font-size: 13px; }
	.empty { padding: 48px; text-align: center; color: var(--text-muted); }
	.emoji { font-size: 40px; display: block; margin-bottom: 12px; }
</style>
