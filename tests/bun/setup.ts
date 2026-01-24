/**
 * @file tests/bun/setup.ts
 * @description Global test setup file for Bun test runner
 */

import { register } from "tsconfig-paths";
import path from "path";
import { mock } from "bun:test";
import { writable } from "svelte/store";

// --------------------------------------
// Force alias resolution for Bun tests
// --------------------------------------
register({
	baseUrl: path.resolve("./"),
	paths: {
		"@paraglide/*": ["src/paraglide/*"],
		"@api/*": ["src/routes/api/*"],
		"@auth/*": ["src/databases/auth/*"],
		"@collections/*": ["config/collections/*"],
		"@components/*": ["src/components/*"],
		"@content/*": ["src/content/*"],
		"@databases/*": ["src/databases/*"],
		"@hooks/*": ["src/hooks/*"],
		"@root/*": ["*"],
		"@services/*": ["src/services/*"],
		"@src/*": ["src/*"],
		"@static/*": ["static/*"],
		"@stores/*": ["src/stores/*"],
		"@themes/*": ["src/themes/*"],
		"@types/*": ["src/types/*"],
		"@utils/*": ["src/utils/*"],
		"@widgets/*": ["src/widgets/*"]
	}
});

// --------------------------------------
// Mock SvelteKit built-in modules
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
// Mock logger (both alias styles used in repo)
// --------------------------------------

const fakeLogger = {
	fatal: () => {},
	error: () => {},
	warn: () => {},
	info: () => {},
	debug: () => {},
	trace: () => {},
	channel: () => ({
		fatal: () => {},
		error: () => {},
		warn: () => {},
		info: () => {},
		debug: () => {},
		trace: () => {}
	})
};

mock.module('@src/utils/logger.server', () => ({ logger: fakeLogger }));
mock.module('@utils/logger.server', () => ({ logger: fakeLogger }));

// --------------------------------------
// Fix failing store imports
// --------------------------------------

mock.module('@stores/loadingStore.svelte', () => ({
	default: writable(false)
}));

mock.module('@stores/screenSizeStore.svelte', () => ({
	default: writable("desktop")
}));

mock.module('@stores/system/index', () => ({
	system: writable({})
}));

// --------------------------------------
// Fix failing utils imports
// --------------------------------------

mock.module('@utils/dateUtils', () => import('../../src/utils/dateUtils'));
mock.module('@utils/errorHandling', () => import('../../src/utils/errorHandling'));
mock.module('@utils/crypto', () => import('../../src/utils/crypto'));
mock.module('@utils/languageUtils', () => import('../../src/utils/languageUtils'));

// --------------------------------------
// Mock Svelte 5 runes
// --------------------------------------

// @ts-ignore
globalThis.$state = (initial: any) => initial;
// @ts-ignore
globalThis.$derived = (fn: any) => fn();
// @ts-ignore
globalThis.$effect = () => {};
// @ts-ignore
globalThis.$effect.root = (fn: any) => fn();
// @ts-ignore
globalThis.$props = () => ({});
