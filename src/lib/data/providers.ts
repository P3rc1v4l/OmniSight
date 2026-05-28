import type { Provider } from '$lib/types';

/*
  Standard-Anbieter (Default-Set).

  Hinweis: Aus der ursprünglichen Liste wurden DREI Einträge bewusst NICHT
  aufgenommen – Burning Series, Cine.to und Movie2k. Das sind keine legalen
  Streaming-Dienste, sondern Portale, die urheberrechtlich geschützte Inhalte
  ohne Lizenz anbieten. OmniHub liefert sie deshalb nicht mit aus.

  Wer eigene Quellen einbinden will, kann das über "Eigenen Anbieter hinzufügen"
  selbst tun (wie ein Lesezeichen im Browser) – die Verantwortung dafür liegt
  dann beim Nutzer.
*/
export const DEFAULT_PROVIDERS: Provider[] = [
	// Film & Serien
	{ id: 'netflix', name: 'Netflix', url: 'https://www.netflix.com', category: 'film-serien', color: '#e50914' },
	{ id: 'prime-video', name: 'Prime Video', url: 'https://www.primevideo.com', category: 'film-serien', color: '#00a8e1' },
	{ id: 'disney-plus', name: 'Disney+', url: 'https://www.disneyplus.com', category: 'film-serien', color: '#113ccf' },
	{ id: 'max', name: 'Max', url: 'https://play.max.com', category: 'film-serien', color: '#002be7' },
	{ id: 'apple-tv-plus', name: 'Apple TV+', url: 'https://tv.apple.com', category: 'film-serien', color: '#000000' },
	{ id: 'paramount-plus', name: 'Paramount+', url: 'https://www.paramountplus.com', category: 'film-serien', color: '#0064ff' },
	{ id: 'mubi', name: 'MUBI', url: 'https://mubi.com', category: 'film-serien', color: '#000000' },

	// Live-TV / Pay-TV
	{ id: 'sky-go', name: 'Sky Go', url: 'https://www.skygo.sky.de', category: 'live-tv', color: '#0072c9' },
	{ id: 'wow', name: 'WOW', url: 'https://www.wowtv.de', category: 'live-tv', color: '#00043c' },
	{ id: 'waipu-tv', name: 'Waipu TV', url: 'https://www.waipu.tv', category: 'live-tv', color: '#fa5300' },
	{ id: 'magenta-tv', name: 'MagentaTV', url: 'https://web.magentatv.de', category: 'live-tv', color: '#e20074' },

	// Anime
	{ id: 'crunchyroll', name: 'Crunchyroll', url: 'https://www.crunchyroll.com', category: 'anime', color: '#f47521' },
	{ id: 'adn', name: 'ADN', url: 'https://animationdigitalnetwork.com', category: 'anime', color: '#0096ff' },

	// Sport / Live-Streaming
	{ id: 'twitch', name: 'Twitch', url: 'https://www.twitch.tv', category: 'video', color: '#9146ff' },
	{ id: 'dazn', name: 'DAZN', url: 'https://www.dazn.com', category: 'sport', color: '#f8f8f8' },

	// Video / Musik
	{ id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com', category: 'video', color: '#ff0000' },
	{ id: 'spotify', name: 'Spotify', url: 'https://open.spotify.com', category: 'musik', color: '#1db954' },

	// Öffentlich-rechtliche & frei empfangbare Mediatheken
	{ id: 'ard-mediathek', name: 'ARD Mediathek', url: 'https://www.ardmediathek.de', category: 'mediathek', color: '#0a3eff' },
	{ id: 'zdf-mediathek', name: 'ZDF Mediathek', url: 'https://www.zdf.de', category: 'mediathek', color: '#fa7d19' },
	{ id: 'arte', name: 'ARTE', url: 'https://www.arte.tv', category: 'mediathek', color: '#ff7f00' },
	{ id: 'funk', name: 'Funk', url: 'https://www.funk.net', category: 'mediathek', color: '#ff0a54' },
	{ id: 'kika', name: 'KiKA', url: 'https://www.kika.de', category: 'mediathek', color: '#5bc500' },
	{ id: 'joyn', name: 'Joyn', url: 'https://www.joyn.de', category: 'mediathek', color: '#ff0c3e' },
	{ id: 'rtl-plus', name: 'RTL+', url: 'https://plus.rtl.de', category: 'mediathek', color: '#e6007e' }
];
