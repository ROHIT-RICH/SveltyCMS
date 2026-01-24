/**
 * @file tests/bun/setup.ts
 */

import { register } from "tsconfig-paths";
import path from "path";
import { mock } from "bun:test";
import { writable, derived } from "svelte/store";

// --------------------------------------
// Alias resolution for Bun
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
// SvelteKit mocks
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
// Logger mocks (all variants used in repo)
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
mock.module('@utils/logger', () => ({ logger: fakeLogger }));

// --------------------------------------
// Store mocks (must match real exports)
// --------------------------------------

// loadingStore.svelte
const LoadingStore = writable(false);

const loadingOperations = {
	start: () => LoadingStore.set(true),
	stop: () => LoadingStore.set(false)
};

mock.module('@stores/loadingStore.svelte', () => ({
	default: LoadingStore,
	LoadingStore,
	loadingOperations
}));

// screenSizeStore.svelte
const ScreenSize = writable("desktop");

function getScreenSizeName() {
	return "desktop";
}

mock.module('@stores/screenSizeStore.svelte', () => ({
	default: ScreenSize,
	ScreenSize,
	getScreenSizeName
}));

// system store
const system = writable({});

function setSystemState(value: any) {
	system.set(value);
}

const isServiceHealthy = derived(system, () => true);

mock.module('@stores/system/index', () => ({
	system,
	setSystemState,
	isServiceHealthy
}));

// --------------------------------------
// Real utils passthrough (with logger fixed)
// --------------------------------------

mock.module('@utils/dateUtils', () => import('../../src/utils/dateUtils'));
mock.module('@utils/errorHandling', () => import('../../src/utils/errorHandling'));
mock.module('@utils/crypto', () => import('../../src/utils/crypto'));
mock.module('@utils/languageUtils', () => import('../../src/utils/languageUtils'));

// --------------------------------------
// Svelte 5 runes
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
