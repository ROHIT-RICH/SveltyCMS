/**
 * @file tests/bun/setup.ts
 * @description Global test setup file for Bun test runner
 *
 * This file is automatically loaded before running Bun tests via the --preload flag.
 * It mocks SvelteKit's built-in modules ($app/*) to allow testing server-side code
 * without requiring a full SvelteKit runtime environment.
 *
 * Mocked modules:
 * - $app/environment: Provides environment flags (browser, dev, etc.)
 * - $app/stores: Provides SvelteKit stores (page, navigating, updated)
 * - $app/navigation: Provides navigation functions (goto, invalidate, etc.)
 * - $app/paths: Provides base and assets paths
 *
 * Usage: Automatically loaded via package.json test scripts with --preload flag
 */

import { register } from "tsconfig-paths";
import path from "path";

// Force Bun to resolve aliases correctly during tests
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
    "@widgets/*": ["src/widgets/*"],
  },
});



import { mock } from 'bun:test';

// Mock $app/environment
mock.module('$app/environment', () => ({
	browser: true,
	building: false,
	dev: true,
	version: 'test'
}));

// Mock logger.server.ts to prevent "cannot be imported in browser" error
mock.module('@src/utils/logger.server', () => ({
	logger: {
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
	}
}));

// Mock $app/stores
mock.module('$app/stores', () => ({
	getStores: () => ({}),
	page: { subscribe: (fn: any) => fn({}) },
	navigating: { subscribe: (fn: any) => fn(null) },
	updated: { subscribe: (fn: any) => fn(false) }
}));

// Mock $app/navigation
mock.module('$app/navigation', () => ({
	goto: () => Promise.resolve(),
	invalidate: () => Promise.resolve(),
	invalidateAll: () => Promise.resolve(),
	preloadData: () => Promise.resolve(),
	preloadCode: () => Promise.resolve(),
	beforeNavigate: () => {},
	afterNavigate: () => {}
}));

// Mock $app/paths
mock.module('$app/paths', () => ({
	base: '',
	assets: ''
}));

// Mock Svelte 5 Runes
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
