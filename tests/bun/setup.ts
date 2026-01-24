/**
 * @file tests/bun/setup.ts
 */

import { register } from "tsconfig-paths";
import path from "path";
import { mock } from "bun:test";

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
// Logger mocks
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
// REAL LoadingStore implementation
// --------------------------------------
class LoadingStore {
	private operations = new Set<string>();

	start(op = "default") {
		this.operations.add(op);
	}

	stop(op = "default") {
		this.operations.delete(op);
	}

	clear() {
		this.operations.clear();
	}

	get isLoading() {
		return this.operations.size > 0;
	}

	get size() {
		return this.operations.size;
	}
}

mock.module('@stores/loadingStore.svelte', () => ({
	LoadingStore,
	default: LoadingStore
}));

// --------------------------------------
// REAL ScreenSize implementation
// --------------------------------------
const ScreenSize = {
	XS: "XS",
	SM: "SM",
	MD: "MD",
	LG: "LG",
	XL: "XL",
	XXL: "XXL"
} as const;

function getScreenSizeName(width: number) {
	if (width < 640) return ScreenSize.XS;
	if (width < 768) return ScreenSize.SM;
	if (width < 1024) return ScreenSize.MD;
	if (width < 1280) return ScreenSize.LG;
	if (width < 1536) return ScreenSize.XL;
	return ScreenSize.XXL;
}

mock.module('@stores/screenSizeStore.svelte', () => ({
	ScreenSize,
	getScreenSizeName,
	default: ScreenSize
}));

// --------------------------------------
// REAL system store implementation
// --------------------------------------
let systemState: any = {};

function setSystemState(state: any) {
	systemState = state;
}

function isServiceHealthy() {
	return true;
}

function startServiceInitialization() {
	return true;
}

mock.module('@stores/system/index', () => ({
	setSystemState,
	isServiceHealthy,
	startServiceInitialization
}));

// --------------------------------------
// Real utils passthrough
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
