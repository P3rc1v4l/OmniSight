// Importiert eine Watchlist aus CSV (Letterboxd, Trakt oder generisch).
// - Zeilen mit TMDB-ID werden exakt über tmdb.details aufgelöst.
// - Zeilen nur mit Titel (z. B. echte Letterboxd-Exporte) werden per tmdb.search
//   zugeordnet (bevorzugt nach Jahr/Typ).
import { get } from 'svelte/store';
import { tmdb } from '$lib/tmdb';
import { watchlist, addToWatchlist } from '$lib/stores/watchlist';
import type { TmdbItem } from '$lib/types';

// --- CSV-Parser (RFC-4180-artig: Anführungszeichen, "" als Escape, Zeilen/Kommas in Quotes) ---
export function parseCsvRows(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let inQuotes = false;
	const s = text.replace(/\r\n?/g, '\n');
	for (let i = 0; i < s.length; i++) {
		const c = s[i];
		if (inQuotes) {
			if (c === '"') {
				if (s[i + 1] === '"') { field += '"'; i++; }
				else inQuotes = false;
			} else field += c;
		} else if (c === '"') inQuotes = true;
		else if (c === ',') { row.push(field); field = ''; }
		else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
		else field += c;
	}
	if (field !== '' || row.length) { row.push(field); rows.push(row); }
	return rows;
}

export function parseCsv(text: string): Record<string, string>[] {
	const raw = parseCsvRows(text).filter((r) => r.length && !(r.length === 1 && r[0].trim() === ''));
	if (raw.length < 2) return [];
	const headers = raw[0].map((h) => h.trim().toLowerCase());
	return raw.slice(1).map((cells) => {
		const o: Record<string, string> = {};
		headers.forEach((h, idx) => { o[h] = (cells[idx] ?? '').trim(); });
		return o;
	});
}

function posterUrl(path: unknown): string | null {
	return typeof path === 'string' && path ? `https://image.tmdb.org/t/p/w500${path}` : null;
}

function itemFromDetails(type: 'movie' | 'tv', id: number, d: Record<string, unknown>): TmdbItem {
	return {
		id,
		media_type: type,
		title: String(d.title ?? d.name ?? ''),
		overview: String(d.overview ?? ''),
		poster: posterUrl(d.poster_path),
		backdrop: posterUrl(d.backdrop_path),
		release_date: (d.release_date ?? d.first_air_date ?? null) as string | null,
		vote_average: (d.vote_average ?? null) as number | null
	};
}

function pickBest(results: TmdbItem[], type: 'movie' | 'tv' | null, year: string): TmdbItem | null {
	if (!results.length) return null;
	const ofType = type ? results.filter((r) => r.media_type === type) : results;
	const pool = ofType.length ? ofType : results;
	if (year) {
		const byYear = pool.find((r) => (r.release_date ?? '').slice(0, 4) === year);
		if (byYear) return byYear;
	}
	return pool[0];
}

function readId(r: Record<string, string>): number {
	const raw = r['tmdbid'] || r['tmdb_id'] || r['tmdb'] || r['tmdb id'] || r['themoviedb id'] || '';
	const n = parseInt(raw, 10);
	return Number.isFinite(n) && n > 0 ? n : 0;
}
function readType(r: Record<string, string>): 'movie' | 'tv' | null {
	const t = (r['type'] || r['mediatype'] || '').toLowerCase();
	if (!t) return null;
	return t === 'show' || t === 'tv' || t === 'series' || t === 'serie' ? 'tv' : 'movie';
}

export async function importWatchlistCsv(
	text: string,
	onProgress?: (done: number, total: number) => void
): Promise<{ added: number; skipped: number; total: number }> {
	const rows = parseCsv(text);
	const total = rows.length;
	if (!total) return { added: 0, skipped: 0, total: 0 };

	const before = get(watchlist).length;
	let skipped = 0;

	for (let i = 0; i < rows.length; i++) {
		const r = rows[i];
		const id = readId(r);
		const type = readType(r);
		const title = r['title'] || r['name'] || '';
		const year = (r['year'] || '').slice(0, 4);
		let item: TmdbItem | null = null;

		try {
			if (id) {
				const d = await tmdb.details(type ?? 'movie', id);
				if (d) item = itemFromDetails(type ?? 'movie', id, d);
			} else if (title) {
				const res = (await tmdb.search(title)) ?? [];
				item = pickBest(res, type, year);
			}
		} catch {
			item = null;
		}

		if (item && item.title && (item.media_type === 'movie' || item.media_type === 'tv')) {
			addToWatchlist(item);
		} else {
			skipped++;
		}
		onProgress?.(i + 1, total);
	}

	const added = get(watchlist).length - before;
	return { added, skipped, total };
}
