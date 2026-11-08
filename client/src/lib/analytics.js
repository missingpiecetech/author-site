// Minilytics analytics and session replay.
//
// vite/minilyticsPlugin.js adds the tracker (minilytics.js) and its replay
// extension (replay/ext.js) to index.html only when PUBLIC_MINILYTICS_HOST,
// PUBLIC_MINILYTICS_SITE_ID and PUBLIC_MINILYTICS_SITE_KEY are all set, which
// only client/.env.production does. In local dev and tests, or when an ad
// blocker stops the scripts, window.minilytics is undefined and every function
// here does nothing. The tracker counts page views itself, including route
// changes (it wraps history.pushState / replaceState). There are no accounts
// on this site, so nothing calls minilytics.identify.

/**
 * Every event name the site sends. Call sites use these keys, never a string,
 * so `grep -rn "EVENTS\." src` lists every place an event fires. Properties
 * carry only ids, counts, formats and enum-like values: never names, emails,
 * free text or search terms. docs/ANALYTICS.md lists each event, where it
 * fires and its properties.
 */
import { reportError } from "./errors.js";

export const EVENTS = Object.freeze({
  ADD_TO_CART: "add_to_cart",
  CART_OPENED: "cart_opened",
  CART_QUANTITY_CHANGED: "cart_quantity_changed",
  CHECKOUT_STARTED: "checkout_started",
  CHECKOUT_ERROR: "checkout_error",
  EDITION_SELECTED: "edition_selected",
  RETAILER_CLICK: "retailer_click",
  NEWSLETTER_OPENED: "newsletter_opened",
  PODCAST_LINK_CLICK: "podcast_link_click",
  SOCIAL_LINK_CLICK: "social_link_click",
  CONTACT_EMAIL_CLICK: "contact_email_click",
  PRESS_KIT_CLICK: "press_kit_click",
  EXCERPT_CHAPTER_VIEW: "excerpt_chapter_view",
  EXCERPT_BLOCK_REACHED: "excerpt_block_reached",
  EXCERPT_BLOCK_READ: "excerpt_block_read",
  EXCERPT_SKIM: "excerpt_skim",
  EXCERPT_CHAPTER_COMPLETE: "excerpt_chapter_complete",
  EXCERPT_NEXT_CLICK: "excerpt_next_click",
  EXCERPT_BUY_CLICK: "excerpt_buy_click",
  EXCERPT_COPY: "excerpt_copy",
});

/**
 * Session replay settings: every visit is eligible, a recording is kept after
 * 20 seconds of visible time, or at once when one of the key conversions
 * fires. A visit that ends before either is never uploaded. No cap or limit
 * on recording.
 */
export const REPLAY_SETTINGS = {
  enabled: true,
  sampleRate: 1,
  thresholdSeconds: 20,
  commitEvents: [
    EVENTS.CHECKOUT_STARTED,
    EVENTS.ADD_TO_CART,
    EVENTS.EXCERPT_BUY_CLICK,
    EVENTS.NEWSLETTER_OPENED,
  ],
};

/**
 * Sends one event. Never throws: a tracker failure must not break the action
 * that triggered it, so call it after the action has succeeded.
 * @param {string} name one of EVENTS
 * @param {Record<string, string | number | boolean | null>} [data]
 */
export const track = (name, data) => {
  try {
    window.minilytics?.track(name, data);
  } catch (error) {
    reportError(error, { code: "analytics_track_failed" });
  }
};

/** Starts session replay with REPLAY_SETTINGS. Call once, at app start. */
export const startReplay = () => {
  try {
    window.minilytics?.startReplay?.(REPLAY_SETTINGS);
  } catch (error) {
    reportError(error, { code: "analytics_replay_failed" });
  }
};
