/**
 * @file tests/bun/setup.ts
 * Bun preload setup for CI
 */

import { mock } from "bun:test";

// Safe mock helper (prevents crash if path not resolved)
function safeMock(path: string, factory: () => any) {
	try {
		mock.module(path, factory);
	} catch {}
}

// -----------------------------
// SvelteKit mocks
// -----------------------------
safeMock('$app/environment', () => ({
	browser: true,
	building: false,
	dev: true,
	version: 'test'
}));

safeMock('$app/stores', () => ({
	getStores: () => ({}),
	page: { subscribe: (fn: any) => fn({}) },
	navigating: { subscribe: (fn: any) => fn(null) },
	updated: { subscribe: (fn: any) => fn(false) }
}));

safeMock('$app/navigation', () => ({
	goto: () => Promise.resolve(),
	invalidate: () => Promise.resolve(),
	invalidateAll: () => Promise.resolve(),
	preloadData: () => Promise.resolve(),
	preloadCode: () => Promise.resolve(),
	beforeNavigate: () => {},
	afterNavigate: () => {}
}));

safeMock('$app/paths', () => ({
	base: '',
	assets: ''
}));

// -----------------------------
// Logger mocks
// -----------------------------
const fakeLogger = {
	fatal: () => {},
	error: () => {},
	warn: () => {},
	info: () => {},
	debug: () => {},
	trace: () => {},
	channel: () => fakeLogger
};

safeMock('@utils/logger', () => ({ logger: fakeLogger }));
safeMock('@utils/logger.server', () => ({ logger: fakeLogger }));
safeMock('@src/utils/logger.server', () => ({ logger: fakeLogger }));

// -----------------------------
// Svelte 5 runes mocks
// -----------------------------
// @ts-ignore
globalThis.$state = (v: any) => v;
// @ts-ignore
globalThis.$derived = (fn: any) => fn();
// @ts-ignore
globalThis.$effect = () => {};
// @ts-ignore
globalThis.$effect.root = (fn: any) => fn();
// @ts-ignore
globalThis.$props = () => ({});

export {};
