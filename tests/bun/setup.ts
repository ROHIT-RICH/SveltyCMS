/**
 * @file tests/bun/setup.ts
 */

import { mock } from 'bun:test';
import { register } from 'tsconfig-paths';
import path from 'path';

// --------------------------------------
// Fix path aliases for Bun (CRITICAL FIX)
// --------------------------------------

const root = path.resolve(process.cwd());

register({
	baseUrl: root,
	paths: {
		"@src/*": ["src/*"],
		"@stores/*": ["src/stores/*"],
		"@utils/*": ["src/utils/*"],
		"@services/*": ["src/services/*"],
		"@widgets/*": ["src/widgets/*"],
		"@types/*": ["src/types/*"],
		"@themes/*": ["src/themes/*"],
		"@components/*": ["src/components/*"],
		"@content/*": ["src/content/*"],
		"@databases/*": ["src/databases/*"],
		"@hooks/*": ["src/hooks/*"],
		"@api/*": ["src/routes/api/*"]
	}
});

// --------------------------------------
// SvelteKit mocks (unchanged)
// --------------------------------------

mock.module('$app/environment', () => ({
	browser: true,
	building: false,
	dev: true,
	version: 'test'
}));

mock.module('$app/stores', () => ({
	getStores: () => ({}),
	page: { subscribe: (fn: any) => fn({}) },
	navigating: { subscribe: (fn: any) => fn(null) },
	updated: { subscribe: (fn: any) => fn(false) }
}));

mock.module('$app/navigation', () => ({
	goto: () => Promise.resolve(),
	invalidate: () => Promise.resolve(),
	invalidateAll: () => Promise.resolve(),
	preloadData: () => Promise.resolve(),
	preloadCode: () => Promise.resolve(),
	beforeNavigate: () => {},
	afterNavigate: () => {}
}));

mock.module('$app/paths', () => ({
	base: '',
	assets: ''
}));

// --------------------------------------
// Logger mock (prevents browser/server crash)
// --------------------------------------

const fakeLogger = {
	fatal: () => {},
	error: () => {},
	warn: () => {},
	info: () => {},
	debug: () => {},
	trace: () => {},
	channel: () => fakeLogger
};

mock.module('@src/utils/logger.server', () => ({ logger: fakeLogger }));
mock.module('@utils/logger.server', () => ({ logger: fakeLogger }));

// --------------------------------------
// Svelte 5 runes
// --------------------------------------

(globalThis as any).$state = (v: any) => v;
(globalThis as any).$derived = (fn: any) => fn();
(globalThis as any).$effect = () => {};
(globalThis as any).$effect.root = (fn: any) => fn();
(globalThis as any).$props = () => ({});
