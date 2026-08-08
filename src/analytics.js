export const ANALYTICS_CONSENT_KEY = 'zippolino-analytics-consent';

export const hasAnalyticsConsent = storage => storage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted';

export const track = (name, data = {}) => {
  if (hasAnalyticsConsent(window.localStorage)) window.dataLayer?.push({ event: name, ...data });
};

