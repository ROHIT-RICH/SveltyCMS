/**
 * @file tests/bun/setup.ts
 */

import { mock } from 'bun:test';

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
// Logger mocks (ALL variants)
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
// Loading Store mock (matches real behavior)
// --------------------------------------

class LoadingStore {
	isLoading = false;
	loadingReason: string | null = null;
	loadingStack = new Set<string>();

	startLoading(reason: string) {
		this.loadingStack.add(reason);
		this.isLoading = true;
		this.loadingReason = reason;
	}

	stopLoading(reason: string) {
		this.loadingStack.delete(reason);
		this.isLoading = this.loadingStack.size > 0;
		this.loadingReason = this.isLoading
			? Array.from(this.loadingStack).slice(-1)[0]
			: null;
	}

	clearLoading() {
		this.loadingStack.clear();
		this.isLoading = false;
		this.loadingReason = null;
	}
}

const loadingOperations = {
	dataFetch: 'data-fetch',
	authentication: 'authentication',
	formSubmission: 'form-submission',
	configSave: 'config-save',
	navigation: 'navigation',
	imageUpload: 'image-upload',
	collectionLoad: 'collection-load'
};

mock.module('@stores/loadingStore.svelte', () => ({
	LoadingStore,
	loadingOperations
}));

// --------------------------------------
// Screen Size Store mock (FULLY test compliant)
// --------------------------------------

enum ScreenSize {
	XS = 'XS',
	SM = 'SM',
	MD = 'MD',
	LG = 'LG',
	XL = 'XL',
	XXL = '2XL'
}

function getScreenSize(width: number): ScreenSize {
	if (width < 640) return ScreenSize.XS;
	if (width < 768) return ScreenSize.SM;
	if (width < 1024) return ScreenSize.MD;
	if (width < 1280) return ScreenSize.LG;
	if (width < 1536) return ScreenSize.XL;
	return ScreenSize.XXL;
}

mock.module('@stores/screenSizeStore.svelte', () => ({
	ScreenSize,
	getScreenSize,
	default: ScreenSize
}));

// --------------------------------------
// System store mock
// --------------------------------------

let systemState: any = {};

function setSystemState(val: any) {
	systemState = val;
}

function resetSystemState() {
	systemState = {};
}

mock.module('@stores/system/index', () => ({
	system: systemState,
	setSystemState,
	resetSystemState
}));

mock.module('@stores/system', () => ({
	system: systemState,
	setSystemState,
	resetSystemState
}));

// --------------------------------------
// Real utils passthrough
// --------------------------------------

mock.module('@utils/dateUtils', () => import('../../src/utils/dateUtils'));
mock.module('@utils/errorHandling', () => import('../../src/utils/errorHandling'));
mock.module('@utils/crypto', () => import('../../src/utils/crypto'));
mock.module('@utils/languageUtils', () => import('../../src/utils/languageUtils'));

// --------------------------------------
// Services passthrough
// --------------------------------------

mock.module('@services/SecurityResponseService', () =>
	import('../../src/services/SecurityResponseService')
);

// --------------------------------------
// Svelte 5 runes
// --------------------------------------

(globalThis as any).$state = (v: any) => v;
(globalThis as any).$derived = (fn: any) => fn();
(globalThis as any).$effect = () => {};
(globalThis as any).$effect.root = (fn: any) => fn();
(globalThis as any).$props = () => ({});
