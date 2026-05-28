import type { Provider } from '$lib/types';

/*
  Standard-Anbieter (24 legale Dienste).

  Bewusst NICHT enthalten (illegale Streaming-Portale): Burning Series, Cine.to,
  Movie2k. Die Funktion "eigenen Anbieter hinzufügen" bleibt davon unberührt –
  wer eigene Adressen einbinden will, kann das selbst tun.
*/
export const DEFAULT_PROVIDERS: Provider[] = [
	{ id: 'netflix',       name: 'Netflix',        subtitle: 'Serien & Filme',          url: 'https://www.netflix.com',         category: 'film-serien', color: '#e50914', color2: '#7a0a10', quality: '4K',    icon: 'netflix' },
	{ id: 'prime-video',   name: 'Prime Video',    subtitle: 'Amazon Originals',        url: 'https://www.primevideo.com',      category: 'film-serien', color: '#1a98ff', color2: '#0c3a6b', quality: '4K',    icon: 'prime' },
	{ id: 'disney-plus',   name: 'Disney+',        subtitle: 'Disney · Marvel · Star Wars', url: 'https://www.disneyplus.com',  category: 'film-serien', color: '#113ccf', color2: '#0a1d6e', quality: '4K',    icon: 'disney' },
	{ id: 'max',           name: 'Max',            subtitle: 'HBO & Warner Bros.',      url: 'https://play.max.com',            category: 'film-serien', color: '#0046fe', color2: '#001a66', quality: '4K',    icon: 'max' },
	{ id: 'apple-tv-plus', name: 'Apple TV+',      subtitle: 'Apple Originals',         url: 'https://tv.apple.com',            category: 'film-serien', color: '#1a1a1a', color2: '#000000', quality: '4K',    icon: 'appletv' },
	{ id: 'paramount-plus',name: 'Paramount+',     subtitle: 'CBS & Paramount Originals', url: 'https://www.paramountplus.com', category: 'film-serien', color: '#0064ff', color2: '#002a8a', quality: '1080p', icon: 'paramount' },
	{ id: 'mubi',          name: 'MUBI',           subtitle: 'Arthouse & Indie',        url: 'https://mubi.com',                category: 'film-serien', color: '#1a1a1a', color2: '#000000', quality: '1080p', icon: 'mubi' },

	{ id: 'sky-go',        name: 'Sky Go',         subtitle: 'Sky Entertainment',       url: 'https://www.skygo.sky.de',        category: 'live-tv',     color: '#0072c9', color2: '#003c70', quality: '1080p', icon: 'sky' },
	{ id: 'wow',           name: 'WOW',            subtitle: 'Serien & Sport',          url: 'https://www.wowtv.de',            category: 'live-tv',     color: '#7f5fff', color2: '#2a1366', quality: '1080p', icon: 'wow' },
	{ id: 'waipu-tv',      name: 'Waipu TV',       subtitle: 'Live-TV & Mediatheken',   url: 'https://www.waipu.tv',            category: 'live-tv',     color: '#fa5300', color2: '#7a2700', quality: '4K',    icon: 'waipu' },
	{ id: 'magenta-tv',    name: 'MagentaTV',      subtitle: 'Deutsche Telekom',        url: 'https://web.magentatv.de',        category: 'live-tv',     color: '#e20074', color2: '#6b0036', quality: '4K',    icon: 'magenta' },

	{ id: 'crunchyroll',   name: 'Crunchyroll',    subtitle: 'Anime & Manga',           url: 'https://www.crunchyroll.com',     category: 'anime',       color: '#f47521', color2: '#7a3210', quality: '1080p', icon: 'crunchyroll' },
	{ id: 'adn',           name: 'ADN',            subtitle: 'Anime Digital Network',   url: 'https://animationdigitalnetwork.com', category: 'anime',   color: '#0096ff', color2: '#003a7a', quality: '1080p', icon: 'adn' },

	{ id: 'twitch',        name: 'Twitch',         subtitle: 'Live-Streams & Gaming',   url: 'https://www.twitch.tv',           category: 'video',       color: '#9146ff', color2: '#3a1c70', quality: '1080p', icon: 'twitch' },
	{ id: 'dazn',          name: 'DAZN',           subtitle: 'Live-Sport',              url: 'https://www.dazn.com',            category: 'sport',       color: '#f8d80f', color2: '#7a6900', quality: '4K',    icon: 'dazn' },
	{ id: 'youtube',       name: 'YouTube',        subtitle: 'Videos & Streams',        url: 'https://www.youtube.com',         category: 'video',       color: '#ff0000', color2: '#7a0000', quality: '4K',    icon: 'youtube' },
	{ id: 'spotify',       name: 'Spotify',        subtitle: 'Musik & Podcasts',        url: 'https://open.spotify.com',        category: 'musik',       color: '#1db954', color2: '#0c5526', quality: '1080p', icon: 'spotify' },

	{ id: 'ard-mediathek', name: 'ARD Mediathek',  subtitle: 'Öffentlich-Rechtlich',    url: 'https://www.ardmediathek.de',     category: 'mediathek',   color: '#0a3eff', color2: '#001a66', quality: 'HD',    icon: 'ard' },
	{ id: 'zdf-mediathek', name: 'ZDF Mediathek',  subtitle: 'Öffentlich-Rechtlich',    url: 'https://www.zdf.de',              category: 'mediathek',   color: '#fa7d19', color2: '#7a3a00', quality: 'HD',    icon: 'zdf' },
	{ id: 'arte',          name: 'ARTE',           subtitle: 'Kultur & Dokumentationen', url: 'https://www.arte.tv',            category: 'mediathek',   color: '#ff7f00', color2: '#7a3900', quality: 'HD',    icon: 'arte' },
	{ id: 'funk',          name: 'Funk',           subtitle: 'Content-Netzwerk ARD/ZDF', url: 'https://www.funk.net',           category: 'mediathek',   color: '#ff0a54', color2: '#7a0226', quality: 'HD',    icon: 'funk' },
	{ id: 'kika',          name: 'KiKA',           subtitle: 'Kinder-Mediathek',        url: 'https://www.kika.de',             category: 'mediathek',   color: '#5bc500', color2: '#1f4d00', quality: 'HD',    icon: 'kika' },
	{ id: 'joyn',          name: 'Joyn',           subtitle: 'Free-TV & Mediathek',     url: 'https://www.joyn.de',             category: 'mediathek',   color: '#ff0c3e', color2: '#7a0420', quality: 'HD',    icon: 'joyn' },
	{ id: 'rtl-plus',      name: 'RTL+',           subtitle: 'Entertainment & Serien',  url: 'https://plus.rtl.de',             category: 'mediathek',   color: '#e6007e', color2: '#6b0036', quality: 'HD',    icon: 'rtlplus' }
];
