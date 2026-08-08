import test from 'node:test';
import assert from 'node:assert/strict';
import { canPrepareOrder, createOrderId, PENDING_PAYMENT_STATUS } from './order.js';

test('order IDs use the ZIP prefix and collision-resistant suffixes', () => {
  const ids = new Set(Array.from({ length: 100 }, createOrderId));
  assert.equal(ids.size, 100);
  for (const id of ids) assert.match(id, /^ZIP-[a-z0-9]+-[a-f0-9]{4}$/);
});

test('pending-payment orders cannot enter kitchen preparation', () => {
  const order = { status: PENDING_PAYMENT_STATUS };
  assert.equal(canPrepareOrder(order), false);
  order.status = 'New';
  assert.equal(canPrepareOrder(order), true);
});
