// Avatar-Helfer: Profile speichern entweder ein Emoji ODER ein hochgeladenes
// Bild als Data-URL. Damit der Store klein bleibt, wird ein Upload auf 128×128
// quadratisch zugeschnitten und komprimiert.
import { browser } from '$app/environment';

/** True, wenn der Avatar ein Bild ist (Data-URL/URL) statt eines Emojis. */
export function isImageAvatar(a?: string | null): boolean {
	return (
		!!a &&
		(a.startsWith('data:') ||
			a.startsWith('http://') ||
			a.startsWith('https://') ||
			a.startsWith('blob:'))
	);
}

const AVATAR_SIZE = 128;

/** Liest eine Bilddatei, schneidet sie quadratisch zu und gibt einen
 *  komprimierten Data-URL (JPEG) zurück. Wirft bei Fehlern. */
export async function processAvatarImage(file: File): Promise<string> {
	if (!browser) throw new Error('Kein Browser-Kontext');
	if (!file.type.startsWith('image/')) throw new Error('Keine Bilddatei');

	const dataUrl: string = await new Promise((res, rej) => {
		const r = new FileReader();
		r.onload = () => res(r.result as string);
		r.onerror = () => rej(new Error('Lesefehler'));
		r.readAsDataURL(file);
	});

	const img: HTMLImageElement = await new Promise((res, rej) => {
		const i = new Image();
		i.onload = () => res(i);
		i.onerror = () => rej(new Error('Bildfehler'));
		i.src = dataUrl;
	});

	const canvas = document.createElement('canvas');
	canvas.width = AVATAR_SIZE;
	canvas.height = AVATAR_SIZE;
	const ctx = canvas.getContext('2d');
	if (!ctx) return dataUrl; // Fallback: Original

	// Center-Crop auf quadratisch.
	const min = Math.min(img.width, img.height);
	const sx = (img.width - min) / 2;
	const sy = (img.height - min) / 2;
	ctx.drawImage(img, sx, sy, min, min, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
	return canvas.toDataURL('image/jpeg', 0.85);
}
