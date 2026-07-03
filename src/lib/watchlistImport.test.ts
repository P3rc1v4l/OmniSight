// Tests für den RFC-4180-artigen CSV-Parser (Letterboxd-/Trakt-/generischer Import).
import { describe, it, expect } from 'vitest';
import { parseCsv } from './watchlistImport';

describe('CSV-Parser', () => {
	it('parst einen echten Letterboxd-Watchlist-Export', () => {
		const csv = 'Date,Name,Year,Letterboxd URI\n2024-01-02,"Dune: Part Two",2024,https://boxd.it/x\n2023-05-01,Oppenheimer,2023,https://boxd.it/y\n';
		const rows = parseCsv(csv);
		expect(rows).toHaveLength(2);
		expect(rows[0].name).toBe('Dune: Part Two');
		expect(rows[0].year).toBe('2024');
	});

	it('parst einen Trakt-Export mit tmdb_id und type', () => {
		const csv = 'tmdb_id,type,title,year,rating\n693134,movie,"Dune: Part Two",2024,10\n100088,show,"The Last of Us",2023,8\n';
		const rows = parseCsv(csv);
		expect(rows[0].tmdb_id).toBe('693134');
		expect(rows[1].type).toBe('show');
	});

	it('behandelt Kommas innerhalb von Anführungszeichen korrekt', () => {
		const csv = 'Title,Year\n"Crouching Tiger, Hidden Dragon",2000\n';
		const rows = parseCsv(csv);
		expect(rows[0].title).toBe('Crouching Tiger, Hidden Dragon');
	});

	it('behandelt escaped-Anführungszeichen ("") korrekt', () => {
		const csv = 'Title,Year\n"The ""Burbs",1989\n';
		const rows = parseCsv(csv);
		expect(rows[0].title).toBe('The "Burbs');
	});

	it('normalisiert Spaltennamen auf Kleinschreibung (tmdbID -> tmdbid)', () => {
		const csv = 'Title,Year,tmdbID,Rating\nDune,2021,438631,4\n';
		const rows = parseCsv(csv);
		expect(rows[0].tmdbid).toBe('438631');
	});

	it('liefert eine leere Liste bei weniger als 2 Zeilen (nur Header oder leer)', () => {
		expect(parseCsv('Title,Year\n')).toHaveLength(0);
		expect(parseCsv('')).toHaveLength(0);
	});

	it('kommt mit Windows-Zeilenenden (CRLF) klar', () => {
		const csv = 'Title,Year\r\nDune,2021\r\n';
		const rows = parseCsv(csv);
		expect(rows).toHaveLength(1);
		expect(rows[0].title).toBe('Dune');
	});
});
