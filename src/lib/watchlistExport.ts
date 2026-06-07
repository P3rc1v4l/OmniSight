// Exportiert die Watchlist in import-fähige CSV-Dateien für Letterboxd und Trakt.
// Bewertung in OmniSight ist 1–5 Sterne.
import type { WatchlistItem } from '$lib/types';

function download(filename: string, text: string): void {
	const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function esc(v: string): string {
	return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}
function year(d?: string | null): string {
	return d && d.length >= 4 ? d.slice(0, 4) : '';
}
function toCsv(rows: string[][]): string {
	return rows.map((r) => r.map(esc).join(',')).join('\n');
}

// Letterboxd: NUR Filme. Import-Spalten laut Letterboxd: Title, Year, tmdbID, Rating (0,5–5).
export function exportLetterboxd(items: WatchlistItem[]): number {
	const movies = items.filter((w) => w.mediaType === 'movie');
	const rows: string[][] = [['Title', 'Year', 'tmdbID', 'Rating']];
	for (const m of movies) {
		rows.push([m.title, year(m.releaseDate), String(m.tmdbId), m.rating ? String(m.rating) : '']);
	}
	download('letterboxd-import.csv', toCsv(rows));
	return movies.length;
}

// Trakt: Filme + Serien. Generisches CSV (z. B. für TraktRater / Trakt-CSV-Import):
// tmdb_id, type (movie/show), title, year, rating (1–10 -> Sterne × 2).
export function exportTrakt(items: WatchlistItem[]): number {
	const rows: string[][] = [['tmdb_id', 'type', 'title', 'year', 'rating']];
	for (const w of items) {
		rows.push([
			String(w.tmdbId),
			w.mediaType === 'tv' ? 'show' : 'movie',
			w.title,
			year(w.releaseDate),
			w.rating ? String(w.rating * 2) : ''
		]);
	}
	download('trakt-import.csv', toCsv(rows));
	return items.length;
}
