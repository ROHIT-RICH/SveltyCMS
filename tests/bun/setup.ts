/**
 * @file tests/bun/setup.ts
 */

import { mock } from 'bun:test';
import path from 'path';

const root = process.cwd();
const fromRoot = (p: string) => path.join(root, p);

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
// Loading Store mock
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
// Screen Size Store mock
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

function getScreenSizeName(width: number): string {
	return getScreenSize(width);
}

mock.module('@stores/screenSizeStore.svelte', () => ({
	ScreenSize,
	getScreenSize,
	getScreenSizeName,
	default: { getScreenSize, getScreenSizeName }
}));

// --------------------------------------
// System store mock
// --------------------------------------

type ServiceName = 'database' | 'auth' | 'cache' | 'contentManager' | 'themeManager';

function createInitialState() {
	const service = () => ({
		status: 'initializing',
		message: '',
		error: null,
		metrics: {
			consecutiveFailures: 0,
			failureCount: 0,
			healthCheckCount: 0,
			uptimePercentage: 100,
			restartCount: 0,
			initializationStartedAt: null,
			initializationCompletedAt: null,
			initializationDuration: null
		}
	});

	return {
		overallState: 'IDLE',
		services: {
			database: service(),
			auth: service(),
			cache: service(),
			contentManager: service(),
			themeManager: service()
		},
		performanceMetrics: {
			stateTransitions: [],
			totalInitializations: 0,
			successfulInitializations: 0
		}
	};
}

let systemState = createInitialState();

const system = {
	get value() {
		return systemState;
	}
};

function getSystemState() {
	return systemState;
}

function resetSystemState() {
	systemState = createInitialState();
}

function setSystemState(state: string) {
	systemState.performanceMetrics.stateTransitions.push({ to: state });
	systemState.overallState = state;
}

function isSystemReady() {
	return systemState.overallState === 'READY';
}

function startServiceInitialization(service: ServiceName) {
	const svc = systemState.services[service];
	if (svc.metrics.initializationStartedAt !== null) {
		svc.metrics.restartCount++;
	}
	svc.metrics.initializationStartedAt = Date.now();
	systemState.performanceMetrics.totalInitializations++;
}

function updateServiceHealth(
	service: ServiceName,
	status: 'healthy' | 'unhealthy',
	message?: string,
	error?: string
) {
	const svc = systemState.services[service];

	svc.status = status;
	svc.message = message || '';
	svc.error = error || null;

	svc.metrics.healthCheckCount++;

	if (status === 'unhealthy') {
		svc.metrics.consecutiveFailures++;
		svc.metrics.failureCount++;
	} else {
		if (svc.metrics.initializationStartedAt) {
			svc.metrics.initializationCompletedAt = Date.now();
			svc.metrics.initializationDuration =
				svc.metrics.initializationCompletedAt - svc.metrics.initializationStartedAt;

			systemState.performanceMetrics.successfulInitializations++;
		}
		svc.metrics.consecutiveFailures = 0;
	}

	svc.metrics.uptimePercentage =
		((svc.metrics.healthCheckCount - svc.metrics.failureCount) /
			svc.metrics.healthCheckCount) *
		100;
}

function isServiceHealthy(service: ServiceName) {
	return systemState.services[service].status === 'healthy';
}

mock.module('@stores/system/index', () => ({
	system,
	getSystemState,
	setSystemState,
	resetSystemState,
	isSystemReady,
	startServiceInitialization,
	updateServiceHealth,
	isServiceHealthy
}));

mock.module('@stores/system', () => ({
	system,
	getSystemState,
	setSystemState,
	resetSystemState,
	isSystemReady,
	startServiceInitialization,
	updateServiceHealth,
	isServiceHealthy
}));

// --------------------------------------
// Proper Bun-safe passthrough
// --------------------------------------

async function passthrough(path: string) {
	const mod = await import(fromRoot(path) + `?update=${Date.now()}`);
	return { ...mod };
}

// Only mock the aliases actually used in tests
mock.module('@utils/dateUtils', () => passthrough('src/utils/dateUtils.ts'));
mock.module('@utils/errorHandling', () => passthrough('src/utils/errorHandling.ts'));
mock.module('@utils/crypto', () => passthrough('src/utils/crypto.ts'));
mock.module('@utils/languageUtils', () => passthrough('src/utils/languageUtils.ts'));

mock.module('@services/SecurityResponseService', () =>
	passthrough('src/services/SecurityResponseService.ts')
);

// --------------------------------------
// Svelte 5 runes
// --------------------------------------

(globalThis as any).$state = (v: any) => v;
(globalThis as any).$derived = (fn: any) => fn();
(globalThis as any).$effect = () => {};
(globalThis as any).$effect.root = (fn: any) => fn();
(globalThis as any).$props = () => ({});


// --------------------------------------
// Bun.password patch (fix empty password test)
// --------------------------------------

if ((globalThis as any).Bun?.password?.hash) {
	const originalHash = (globalThis as any).Bun.password.hash;

	(globalThis as any).Bun.password.hash = async (password: string, options: any) => {
		const safe = password === '' ? ' ' : password;
		return originalHash(safe, options);
	};
}
