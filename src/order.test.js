import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrderId } from './order.js';

test('order IDs use the ZIP prefix and collision-resistant suffixes', () => {
  const ids = new Set(Array.from({ length: 100 }, createOrderId));
  assert.equal(ids.size, 100);
  for (const id of ids) assert.match(id, /^ZIP-[a-z0-9]+-[a-f0-9]{4}$/);
});

