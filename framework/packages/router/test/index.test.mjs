import test from 'node:test';
import assert from 'node:assert/strict';
import * as router from '../src/index.js';

test('router package entrypoint exports both public APIs', () => {
  assert.equal(typeof router.scanAppDirectory, 'function');
  assert.equal(typeof router.matchRoute, 'function');
});
