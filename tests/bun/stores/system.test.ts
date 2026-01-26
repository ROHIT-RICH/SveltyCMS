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
// FULL System Store mock (matches tests)
// --------------------------------------

type ServiceName = 'database' | 'auth' | 'cache' | 'contentManager' | 'themeManager';
type ServiceStatus = 'healthy' | 'unhealthy' | 'initializing';
type OverallState = 'IDLE' | 'INITIALIZING' | 'READY' | 'DEGRADED' | 'FAILED';

function createService() {
	return {
		status: 'initializing' as ServiceStatus,
		message: undefined as string | undefined,
		error: undefined as string | undefined,
		metrics: {
			initializationStartedAt: undefined as number | undefined,
			initializationCompletedAt: undefined as number | undefined,
			initializationDuration: undefined as number | undefined,
			consecutiveFailures: 0,
			failureCount: 0,
			healthCheckCount: 0,
			restartCount: 0,
			uptimePercentage: 100
		}
	};
}

function createInitialState() {
	return {
		overallState: 'IDLE' as OverallState,
		message: undefined as string | undefined,
		services: {
			database: createService(),
			auth: createService(),
			cache: createService(),
			contentManager: createService(),
			themeManager: createService()
		},
		performanceMetrics: {
			stateTransitions: [] as { from?: OverallState; to: OverallState }[],
			totalInitializations: 0,
			successfulInitializations: 0
		}
	};
}

let systemState = createInitialState();

function getSystemState() {
	return systemState;
}

function resetSystemState() {
	systemState = createInitialState();
}

function setSystemState(state: OverallState, message?: string) {
	systemState.performanceMetrics.stateTransitions.push({
		from: systemState.overallState,
		to: state
	});
	systemState.overallState = state;
	systemState.message = message;
}

function startServiceInitialization(service: ServiceName) {
	const svc = systemState.services[service];
	svc.metrics.initializationStartedAt = Date.now();
	systemState.performanceMetrics.totalInitializations++;
}

function updateServiceHealth(
	service: ServiceName,
	status: ServiceStatus,
	message?: string,
	error?: string
) {
	const svc = systemState.services[service];

	svc.status = status;
	svc.message = message;
	svc.error = error;

	svc.metrics.healthCheckCount++;

	if (status === 'unhealthy') {
		svc.metrics.failureCount++;
		svc.metrics.consecutiveFailures++;
		svc.metrics.uptimePercentage =
			100 - (svc.metrics.failureCount / svc.metrics.healthCheckCount) * 100;
	} else {
		svc.metrics.consecutiveFailures = 0;
		systemState.performanceMetrics.successfulInitializations++;
	}

	if (svc.metrics.initializationStartedAt && !svc.metrics.initializationCompletedAt) {
		svc.metrics.initializationCompletedAt = Date.now();
		svc.metrics.initializationDuration =
			svc.metrics.initializationCompletedAt - svc.metrics.initializationStartedAt;
		svc.metrics.restartCount++;
	}
}

function isServiceHealthy(service: ServiceName) {
	return systemState.services[service].status === 'healthy';
}

function isSystemReady() {
	return systemState.overallState === 'READY';
}

mock.module('@stores/system/index', () => ({
	getSystemState,
	setSystemState,
	resetSystemState,
	startServiceInitialization,
	updateServiceHealth,
	isServiceHealthy,
	isSystemReady
}));

mock.module('@stores/system', () => ({
	getSystemState,
	setSystemState,
	resetSystemState,
	startServiceInitialization,
	updateServiceHealth,
	isServiceHealthy,
	isSystemReady
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
