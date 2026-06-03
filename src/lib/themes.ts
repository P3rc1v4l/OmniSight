// Theme-Presets: fertige, in sich stimmige Farbschemata.
// Ein Preset überschreibt die 9 Paletten-Variablen (siehe app.css [data-theme]) inline
// und bringt einen passenden Akzent mit. 'default' nutzt die Standard-Palette (Hell/Dunkel).

export interface ThemeVars {
	bg: string;
	bgElev: string;
	bgCard: string;
	bgCard2: string;
	text: string;
	textMuted: string;
	textDim: string;
	border: string;
	borderStrong: string;
}

export interface ThemePreset {
	id: string;
	name: { de: string; en: string };
	mode: 'light' | 'dark';
	/** Fehlt nur bei 'default' (dann gilt die Standard-Palette aus app.css). */
	vars?: ThemeVars;
	/** Passender Akzent; wird beim Auswählen als globale Akzentfarbe gesetzt. */
	accent?: string;
	accentText?: string;
}

export const THEME_PRESETS: ThemePreset[] = [
	{
		id: 'default',
		name: { de: 'Standard', en: 'Default' },
		mode: 'dark'
	},
	{
		id: 'midnight',
		name: { de: 'Mitternacht', en: 'Midnight' },
		mode: 'dark',
		vars: {
			bg: '#0a0e1a', bgElev: '#0f1626', bgCard: '#141d33', bgCard2: '#1b2742',
			text: '#e9eefb', textMuted: '#8a96b4', textDim: '#59617c',
			border: '#1f2a44', borderStrong: '#2d3a5a'
		},
		accent: '#5b8dff', accentText: '#04122e'
	},
	{
		id: 'graphite',
		name: { de: 'Graphit', en: 'Graphite' },
		mode: 'dark',
		vars: {
			bg: '#121212', bgElev: '#181818', bgCard: '#1e1e1e', bgCard2: '#262626',
			text: '#ececec', textMuted: '#9a9a9a', textDim: '#6a6a6a',
			border: '#2a2a2a', borderStrong: '#383838'
		},
		accent: '#e0a86a', accentText: '#2a1c08'
	},
	{
		id: 'amethyst',
		name: { de: 'Amethyst', en: 'Amethyst' },
		mode: 'dark',
		vars: {
			bg: '#15101f', bgElev: '#1c1430', bgCard: '#241836', bgCard2: '#2e2044',
			text: '#efe8f9', textMuted: '#a394be', textDim: '#6f6088',
			border: '#2c1f44', borderStrong: '#3c2c5c'
		},
		accent: '#b388f9', accentText: '#1c0e30'
	},
	{
		id: 'forest',
		name: { de: 'Wald', en: 'Forest' },
		mode: 'dark',
		vars: {
			bg: '#0c1410', bgElev: '#101c16', bgCard: '#14241c', bgCard2: '#1b3026',
			text: '#e6f1ea', textMuted: '#87a394', textDim: '#5a7064',
			border: '#1d3328', borderStrong: '#2a4a3a'
		},
		accent: '#4fcf8b', accentText: '#042014'
	},
	{
		id: 'sunset',
		name: { de: 'Sonnenuntergang', en: 'Sunset' },
		mode: 'dark',
		vars: {
			bg: '#1a1110', bgElev: '#241715', bgCard: '#2e1d1a', bgCard2: '#3a2723',
			text: '#f7ebe7', textMuted: '#b89a92', textDim: '#806a64',
			border: '#3a221e', borderStrong: '#5a342c'
		},
		accent: '#ff8a4f', accentText: '#2e1004'
	},
	{
		id: 'nord',
		name: { de: 'Nord', en: 'Nord' },
		mode: 'dark',
		vars: {
			bg: '#2e3440', bgElev: '#353d4a', bgCard: '#3b4252', bgCard2: '#434c5e',
			text: '#eceff4', textMuted: '#abb4c4', textDim: '#7884a0',
			border: '#434c5e', borderStrong: '#4c566a'
		},
		accent: '#88c0d0', accentText: '#14202b'
	},
	{
		id: 'paper',
		name: { de: 'Papier', en: 'Paper' },
		mode: 'light',
		vars: {
			bg: '#f4f1ea', bgElev: '#fffdf8', bgCard: '#fffdf8', bgCard2: '#ece7db',
			text: '#2a2622', textMuted: '#6b6358', textDim: '#9a9286',
			border: '#e0d9cb', borderStrong: '#cabfa9'
		},
		accent: '#c07a3e', accentText: '#fff6ec'
	},
	{
		id: 'contrast',
		name: { de: 'Hoher Kontrast', en: 'High contrast' },
		mode: 'light',
		vars: {
			bg: '#ffffff', bgElev: '#ffffff', bgCard: '#ffffff', bgCard2: '#f0f0f0',
			text: '#000000', textMuted: '#2a2a2a', textDim: '#555555',
			border: '#000000', borderStrong: '#000000'
		},
		accent: '#0040ff', accentText: '#ffffff'
	}
];

export function getPreset(id: string | undefined | null): ThemePreset | undefined {
	return THEME_PRESETS.find((p) => p.id === id);
}

// Reihenfolge der CSS-Variablennamen passend zu ThemeVars (für An-/Abwählen in applySettings).
export const PRESET_VAR_MAP: [keyof ThemeVars, string][] = [
	['bg', '--bg'],
	['bgElev', '--bg-elev'],
	['bgCard', '--bg-card'],
	['bgCard2', '--bg-card-2'],
	['text', '--text'],
	['textMuted', '--text-muted'],
	['textDim', '--text-dim'],
	['border', '--border'],
	['borderStrong', '--border-strong']
];
