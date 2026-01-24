/**
 * @file tests/bun/setup.ts
 */

import { register } from "tsconfig-paths";
import path from "path";
import { mock } from "bun:test";
import { writable, derived } from "svelte/store";

// --------------------------------------
// Fix path aliases for Bun
// --------------------------------------

const root = path.resolve(process.cwd());

register({
  baseUrl: root,
  paths: {
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
    "@api/*": ["src/routes/api/*"],
    "@src/*": ["src/*"]
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

mock.module('@utils/logger', () => ({ logger: fakeLogger }));
mock.module('@utils/logger.server', () => ({ logger: fakeLogger }));
mock.module('@src/utils/logger.server', () => ({ logger: fakeLogger }));

// --------------------------------------
// Store mocks (fix missing imports)
// --------------------------------------

// loadingStore.svelte
const LoadingStoreClass = class {
  loadingStack = new Set<string>();
  loadingReason: string | null = null;

  get isLoading() {
    return this.loadingStack.size > 0;
  }

  startLoading(reason: string) {
    if (!reason) return;
    this.loadingStack.add(reason);
    this.loadingReason = reason;
  }

  stopLoading(reason: string) {
    this.loadingStack.delete(reason);
    this.loadingReason = this.loadingStack.size
      ? Array.from(this.loadingStack).at(-1)!
      : null;
  }

  clearLoading() {
    this.loadingStack.clear();
    this.loadingReason = null;
  }
};

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
  LoadingStore: LoadingStoreClass,
  loadingOperations
}));

// screenSizeStore.svelte
mock.module('@stores/screenSizeStore.svelte', () => ({
  ScreenSize: {
    XS: 'XS',
    SM: 'SM',
    MD: 'MD',
    LG: 'LG',
    XL: 'XL',
    XXL: '2XL'
  },
  getScreenSizeName: () => 'MD'
}));

// system store
const system = writable({});
mock.module('@stores/system/index', () => ({
  system,
  setSystemState: (v: any) => system.set(v),
  resetSystemState: () => system.set({}),
  updateServiceHealth: () => {},
  isServiceHealthy: derived(system, () => true)
}));

// --------------------------------------
// Svelte 5 runes mocks
// --------------------------------------

(globalThis as any).$state = (v: any) => v;
(globalThis as any).$derived = (fn: any) => fn();
(globalThis as any).$effect = () => {};
(globalThis as any).$effect.root = (fn: any) => fn();
(globalThis as any).$props = () => ({});
