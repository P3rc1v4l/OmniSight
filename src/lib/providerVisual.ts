import type { Provider } from '$lib/types';
import { brandIcons } from '$lib/data/brandIcons';

// Liefert die Domain für ein Favicon – aber nur, wenn der Anbieter weder ein
// eigenes Bild noch ein gebündeltes Marken-SVG hat. Sonst null.
export function faviconDomain(p: Provider): string | null {
	const isImage = !!p.icon && /^(data:|https?:)/i.test(p.icon);
	if (isImage || brandIcons[p.id]) return null;
	try {
		return new URL(p.url).hostname.replace(/^www\./, '');
	} catch {
		return null;
	}
}
