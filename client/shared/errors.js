// The sentences users read when something fails, and the rules for what may
// reach GlitchTip. Shared by the browser, the Pages Functions and their dev-server
// twins, so the same failure reads the same everywhere. Users never see a status
// code, an error code or library text; GlitchTip gets those instead.

export const CONNECTION_FAILED =
  "We could not connect. Please check your connection and try again.";
export const SERVER_FAILED =
  "Something went wrong on our end. Please try again in a few minutes.";
export const STORE_UNAVAILABLE =
  "The store is not available right now. Please try again in a few minutes.";
export const CATALOG_FAILED =
  "We could not load the store. Please try again in a few minutes.";
export const CHECKOUT_FAILED =
  "We could not start checkout, and you have not been charged. Please try again in a few minutes.";
export const CUSTOMER_FAILED =
  "We could not save your details. Please try again in a few minutes.";
export const FEED_FAILED = "We could not load the Instagram posts right now.";

const EMAIL = /[^\s"'<>:,]+@[^\s"'<>:,]+\.[^\s"'<>:,]+/g;
const BEARER_TOKEN = /Bearer\s+[^\s"']+/gi;

const scrubText = (text) =>
  typeof text === "string"
    ? text.replace(EMAIL, "[email]").replace(BEARER_TOKEN, "Bearer [token]")
    : text;

/**
 * Last stop before an event leaves for GlitchTip: drops request bodies, headers,
 * query strings and user data, and masks emails and tokens that a library wrote
 * into an error message (Square's messages quote the request).
 * @param {import("@sentry/core").ErrorEvent} event
 */
const scrubEvent = (event) => {
  delete event.user;
  delete event.breadcrumbs;
  if (event.request) {
    event.request = { url: event.request.url?.split(/[?#]/)[0] };
  }
  if (event.message) event.message = scrubText(event.message);
  for (const exception of event.exception?.values || []) {
    exception.value = scrubText(exception.value);
  }
  return event;
};

/** Sentry options both SDKs share. */
export const REPORTING_OPTIONS = {
  sendDefaultPii: false,
  maxBreadcrumbs: 0,
  beforeSend: scrubEvent,
};
