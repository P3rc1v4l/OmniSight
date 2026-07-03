// Tests für den Episoden-Fortschritt (Schlüssel-Format, Zähllogik).
import { describe, it, expect } from 'vitest';
import { epKey, isEpisodeWatched, seasonWatchedCount } from './episodeProgress';

describe('Episoden-Fortschritt', () => {
	it('erzeugt den erwarteten Schlüssel', () => {
		expect(epKey(1399, 1, 5)).toBe('tv-1399-s1e5');
	});

	it('erkennt abgehakte Episoden korrekt', () => {
		const list = ['tv-1399-s1e1', 'tv-1399-s1e2', 'tv-42-s1e1'];
		expect(isEpisodeWatched(list, 1399, 1, 1)).toBe(true);
		expect(isEpisodeWatched(list, 1399, 1, 3)).toBe(false);
		expect(isEpisodeWatched(list, 1399, 2, 1)).toBe(false); // andere Staffel
		expect(isEpisodeWatched(list, 999, 1, 1)).toBe(false); // andere Serie
	});

	it('zählt abgehakte Episoden einer Staffel korrekt', () => {
		const list = ['tv-1399-s1e1', 'tv-1399-s1e2', 'tv-1399-s1e5', 'tv-1399-s2e1'];
		expect(seasonWatchedCount(list, 1399, 1, [1, 2, 3, 4, 5])).toBe(3);
		expect(seasonWatchedCount(list, 1399, 2, [1, 2, 3])).toBe(1);
		expect(seasonWatchedCount(list, 1399, 3, [1, 2])).toBe(0);
	});
});
