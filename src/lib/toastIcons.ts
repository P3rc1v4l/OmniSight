// Zentrale Zuordnung: Toast-/Benachrichtigungs-Emoji -> Lucide-Icon.
// Die pushToast/pushNotification-API bleibt unverändert (Emoji-Strings);
// die Anzeige-Komponenten übersetzen bekannte Emojis in Icons.
// Unbekannte Emojis werden unverändert angezeigt (Fallback).
import type { Component } from 'svelte';
import {
	TriangleAlert, CircleCheck, Check, Info, Tv, Download, Upload, Dices, Film,
	Ban, LockOpen, Lock, KeyRound, Save, Moon, Star, Bell, Trophy, PartyPopper,
	Rss, AlarmClock, Trash2, Bookmark, Sparkles
} from '@lucide/svelte';

const MAP: Record<string, Component> = {
	'⚠️': TriangleAlert,
	'✅': CircleCheck,
	'✓': Check,
	'ℹ️': Info,
	'📺': Tv,
	'📥': Download,
	'📤': Upload,
	'🎲': Dices,
	'🎬': Film,
	'🚫': Ban,
	'🔓': LockOpen,
	'🔒': Lock,
	'🔑': KeyRound,
	'💾': Save,
	'🌙': Moon,
	'⭐': Star,
	'🔔': Bell,
	'🏆': Trophy,
	'🎉': PartyPopper,
	'📡': Rss,
	'⏰': AlarmClock,
	'🗑️': Trash2,
	'🔖': Bookmark,
	'⛩️': Sparkles
};

export function toastIcon(emoji: string | undefined | null): Component | null {
	if (!emoji) return null;
	return MAP[emoji.trim()] ?? null;
}
