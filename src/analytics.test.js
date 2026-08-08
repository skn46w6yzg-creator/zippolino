import test from 'node:test';
import assert from 'node:assert/strict';
import { ANALYTICS_CONSENT_KEY, hasAnalyticsConsent } from './analytics.js';

test('analytics stays blocked until consent is accepted', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null };
  assert.equal(hasAnalyticsConsent(storage), false);
  values.set(ANALYTICS_CONSENT_KEY, 'declined');
  assert.equal(hasAnalyticsConsent(storage), false);
  values.set(ANALYTICS_CONSENT_KEY, 'accepted');
  assert.equal(hasAnalyticsConsent(storage), true);
});

