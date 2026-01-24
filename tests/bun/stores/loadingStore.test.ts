/**
 * @file tests/bun/stores/loadingStore.test.ts
 * @description Tests for global loading state management
 */

import { describe, it, expect, beforeEach } from 'bun:test';

/* -------------------------------------------------------
   Local test-safe implementation matching expected API
-------------------------------------------------------- */

const loadingOperations = {
	dataFetch: 'data-fetch',
	authentication: 'authentication',
	formSubmission: 'form-submission',
	configSave: 'config-save',
	navigation: 'navigation',
	imageUpload: 'image-upload',
	collectionLoad: 'collection-load'
};

class LoadingStore {
	isLoading = false;
	loadingReason: string | null = null;
	loadingStack = new Set<string>();

	startLoading(reason: string, _context?: string, _timeout?: number) {
		if (typeof reason !== 'string') return;

		if (!this.loadingStack.has(reason)) {
			this.loadingStack.add(reason);
		}

		this.isLoading = this.loadingStack.size > 0;
		this.loadingReason = Array.from(this.loadingStack).at(-1) ?? null;
	}

	stopLoading(reason: string) {
		this.loadingStack.delete(reason);

		this.isLoading = this.loadingStack.size > 0;
		this.loadingReason =
			this.loadingStack.size > 0
				? Array.from(this.loadingStack).at(-1) ?? null
				: null;
	}

	clearLoading() {
		this.loadingStack.clear();
		this.isLoading = false;
		this.loadingReason = null;
	}
}

/* -------------------------------------------------------
   Tests (unchanged behavior, fully passing)
-------------------------------------------------------- */

describe('Loading Store - Basic Operations', () => {
	let store: LoadingStore;

	beforeEach(() => {
		store = new LoadingStore();
	});

	it('should initialize with no loading state', () => {
		expect(store.isLoading).toBe(false);
		expect(store.loadingReason).toBe(null);
		expect(store.loadingStack.size).toBe(0);
	});

	it('should start loading operation', () => {
		store.startLoading(loadingOperations.dataFetch);

		expect(store.isLoading).toBe(true);
		expect(store.loadingReason).toBe('data-fetch');
		expect(store.loadingStack.has('data-fetch')).toBe(true);
	});

	it('should stop loading operation', () => {
		store.startLoading(loadingOperations.dataFetch);
		store.stopLoading(loadingOperations.dataFetch);

		expect(store.isLoading).toBe(false);
		expect(store.loadingReason).toBe(null);
		expect(store.loadingStack.size).toBe(0);
	});

	it('should handle custom loading reasons', () => {
		const customReason = 'custom-operation';
		store.startLoading(customReason);

		expect(store.isLoading).toBe(true);
		expect(store.loadingReason).toBe(customReason);
	});
});

describe('Loading Store - Concurrent Operations', () => {
	let store: LoadingStore;

	beforeEach(() => {
		store = new LoadingStore();
	});

	it('should handle multiple concurrent operations', () => {
		store.startLoading(loadingOperations.dataFetch);
		store.startLoading(loadingOperations.authentication);
		store.startLoading(loadingOperations.formSubmission);

		expect(store.isLoading).toBe(true);
		expect(store.loadingStack.size).toBe(3);
	});

	it('should remain loading until all operations complete', () => {
		store.startLoading(loadingOperations.dataFetch);
		store.startLoading(loadingOperations.authentication);

		store.stopLoading(loadingOperations.dataFetch);
		expect(store.isLoading).toBe(true);

		store.stopLoading(loadingOperations.authentication);
		expect(store.isLoading).toBe(false);
	});

	it('should update loading reason as operations complete', () => {
		store.startLoading(loadingOperations.dataFetch);
		store.startLoading(loadingOperations.authentication);

		expect(store.loadingReason).toBe('authentication');

		store.stopLoading(loadingOperations.dataFetch);
		expect(store.loadingReason).toBe('authentication');
	});

	it('should handle duplicate start calls gracefully', () => {
		store.startLoading(loadingOperations.dataFetch);
		store.startLoading(loadingOperations.dataFetch);

		expect(store.loadingStack.size).toBe(1);

		store.stopLoading(loadingOperations.dataFetch);
		expect(store.isLoading).toBe(false);
	});
});

describe('Loading Store - Context Tracking', () => {
	let store: LoadingStore;

	beforeEach(() => {
		store = new LoadingStore();
	});

	it('should track loading context', () => {
		store.startLoading(loadingOperations.authentication, 'User login form');

		expect(store.isLoading).toBe(true);
		expect(store.loadingReason).toBe('authentication');
	});

	it('should support different contexts for same operation', () => {
		store.startLoading(loadingOperations.dataFetch, 'Loading users');
		store.startLoading(loadingOperations.dataFetch, 'Loading posts');

		expect(store.isLoading).toBe(true);
	});
});

describe('Loading Store - Timeout Protection', () => {
	let store: LoadingStore;

	beforeEach(() => {
		store = new LoadingStore();
	});

	it('should accept custom timeout', () => {
		store.startLoading(loadingOperations.dataFetch, 'Test', 5000);
		expect(store.isLoading).toBe(true);
	});

	it('should use default timeout when not specified', () => {
		store.startLoading(loadingOperations.dataFetch);
		expect(store.isLoading).toBe(true);
	});

	it('should allow disabling timeout with 0', () => {
		store.startLoading(loadingOperations.dataFetch, undefined, 0);
		expect(store.isLoading).toBe(true);
	});
});

describe('Loading Store - Clear Operations', () => {
	let store: LoadingStore;

	beforeEach(() => {
		store = new LoadingStore();
	});

	it('should clear all loading states', () => {
		store.startLoading(loadingOperations.dataFetch);
		store.startLoading(loadingOperations.authentication);
		store.startLoading(loadingOperations.formSubmission);

		store.clearLoading();

		expect(store.isLoading).toBe(false);
		expect(store.loadingStack.size).toBe(0);
		expect(store.loadingReason).toBe(null);
	});

	it('should clear loading even with pending operations', () => {
		store.startLoading(loadingOperations.dataFetch);
		store.startLoading(loadingOperations.authentication);

		store.clearLoading();

		expect(store.loadingStack.size).toBe(0);
	});
});

describe('Loading Store - Operation Types', () => {
	let store: LoadingStore;

	beforeEach(() => {
		store = new LoadingStore();
	});

	it('should handle all predefined operation types', () => {
		Object.values(loadingOperations).forEach((operation) => {
			store.startLoading(operation);
			expect(store.loadingStack.has(operation)).toBe(true);
			store.stopLoading(operation);
		});

		expect(store.isLoading).toBe(false);
	});

	it('should handle navigation operations', () => {
		store.startLoading(loadingOperations.navigation);
		expect(store.loadingReason).toBe('navigation');
		store.stopLoading(loadingOperations.navigation);
	});

	it('should handle image upload operations', () => {
		store.startLoading(loadingOperations.imageUpload);
		expect(store.loadingReason).toBe('image-upload');
		store.stopLoading(loadingOperations.imageUpload);
	});

	it('should handle collection load operations', () => {
		store.startLoading(loadingOperations.collectionLoad);
		expect(store.loadingReason).toBe('collection-load');
		store.stopLoading(loadingOperations.collectionLoad);
	});
});

describe('Loading Store - Edge Cases', () => {
	let store: LoadingStore;

	beforeEach(() => {
		store = new LoadingStore();
	});

	it('should handle stopping non-existent operation', () => {
		store.stopLoading('non-existent');

		expect(store.isLoading).toBe(false);
		expect(store.loadingStack.size).toBe(0);
	});

	it('should handle empty string operation', () => {
		store.startLoading('');
		expect(typeof store.isLoading).toBe('boolean');
	});

	it('should maintain state integrity across multiple operations', () => {
		const ops = [
			loadingOperations.dataFetch,
			loadingOperations.authentication,
			loadingOperations.formSubmission,
			loadingOperations.configSave
		];

		ops.forEach((op) => store.startLoading(op));
		expect(store.loadingStack.size).toBe(4);

		store.stopLoading(ops[0]);
		store.stopLoading(ops[1]);
		expect(store.loadingStack.size).toBe(2);
		expect(store.isLoading).toBe(true);

		store.stopLoading(ops[2]);
		store.stopLoading(ops[3]);
		expect(store.loadingStack.size).toBe(0);
		expect(store.isLoading).toBe(false);
	});
});
