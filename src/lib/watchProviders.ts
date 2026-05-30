// Gemeinsame Logik für „Wo läuft der Titel": wandelt die TMDB-`watch/providers`
// in klickbare Anbieter um. Die id passt zu den OmniHub-Kacheln, damit die
// Anmelde-Sitzung geteilt wird; unbekannte Anbieter führen zur JustWatch-Seite.

export interface WatchProvider {
	name: string;
	logo: string;
	url: string;
	id: string;
}

const PROVIDER_MAP: Record<string, { id: string; url: (t: string) => string }> = {
	Netflix: { id: 'netflix', url: (t) => `https://www.netflix.com/search?q=${encodeURIComponent(t)}` },
	'Amazon Prime Video': { id: 'prime-video', url: (t) => `https://www.amazon.de/s?k=${encodeURIComponent(t)}&i=instant-video` },
	'Amazon Video': { id: 'prime-video', url: (t) => `https://www.amazon.de/s?k=${encodeURIComponent(t)}&i=instant-video` },
	'Disney Plus': { id: 'disney-plus', url: (t) => `https://www.disneyplus.com/search?q=${encodeURIComponent(t)}` },
	Crunchyroll: { id: 'crunchyroll', url: (t) => `https://www.crunchyroll.com/search?q=${encodeURIComponent(t)}` },
	WOW: { id: 'wow', url: () => 'https://www.wowtv.de/' },
	'Apple TV Plus': { id: 'apple-tv-plus', url: (t) => `https://tv.apple.com/search?term=${encodeURIComponent(t)}` },
	'Apple TV': { id: 'apple-tv-plus', url: (t) => `https://tv.apple.com/search?term=${encodeURIComponent(t)}` },
	'RTL+': { id: 'rtl-plus', url: (t) => `https://plus.rtl.de/suche?q=${encodeURIComponent(t)}` },
	Joyn: { id: 'joyn', url: (t) => `https://www.joyn.de/suche?q=${encodeURIComponent(t)}` },
	'Joyn Plus': { id: 'joyn', url: (t) => `https://www.joyn.de/suche?q=${encodeURIComponent(t)}` },
	MagentaTV: { id: 'magenta-tv', url: () => 'https://web.magentatv.de/' },
	'Paramount Plus': { id: 'paramount-plus', url: (t) => `https://www.paramountplus.com/search/?query=${encodeURIComponent(t)}` },
	YouTube: { id: 'youtube', url: (t) => `https://www.youtube.com/results?search_query=${encodeURIComponent(t)}` }
};

function resolveTarget(name: string, title: string, fallback: string | null): { url: string; id: string } {
	const m = PROVIDER_MAP[name];
	if (m) return { url: m.url(title), id: m.id };
	return {
		url: fallback || `https://www.google.com/search?q=${encodeURIComponent(`${title} ${name} stream`)}`,
		id: 'web-info'
	};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractWatchProviders(details: any, title: string): WatchProvider[] {
	const wp = details?.['watch/providers']?.results ?? {};
	const region = wp['DE'] ?? wp['US'] ?? null;
	if (!region) return [];
	const link: string | null = region.link ?? null;
	const seen = new Set<number>();
	const out: WatchProvider[] = [];
	for (const key of ['flatrate', 'free', 'ads', 'rent', 'buy']) {
		for (const p of region[key] ?? []) {
			if (seen.has(p.provider_id)) continue;
			seen.add(p.provider_id);
			const t = resolveTarget(p.provider_name, title, link);
			out.push({
				name: p.provider_name,
				logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`,
				url: t.url,
				id: t.id
			});
		}
	}
	return out;
}
