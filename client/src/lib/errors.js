import * as Sentry from "@sentry/browser";
import {
  CONNECTION_FAILED,
  REPORTING_OPTIONS,
  SERVER_FAILED,
} from "../../shared/errors.js";

/** Starts GlitchTip reporting. Call once, at app start. Dev and tests have no DSN. */
export const startErrorReporting = () => {
  const dsn = import.meta.env.PUBLIC_GLITCHTIP_DSN;
  if (dsn) {
    Sentry.init({ dsn, ...REPORTING_OPTIONS });
  } else if (import.meta.env.PROD) {
    console.error("PUBLIC_GLITCHTIP_DSN is not set: errors are not reported.");
  }
};

/**
 * Sends a failure to GlitchTip: the error with its cause, plus the status, code,
 * method and URL when there are any.
 * @param {Error} error
 * @param {{ status?: number, code?: string, method?: string, url?: string }} [failure]
 */
export const reportError = (error, failure = {}) => {
  Sentry.withScope((scope) => {
    scope.setContext("failure", failure);
    if (failure.status)
      scope.setTag("http.status_code", String(failure.status));
    if (failure.code) scope.setTag("error.code", failure.code);
    Sentry.captureException(error);
  });
};

/** An error whose message is a sentence written for the person reading the page. */
export class UserError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "UserError";
  }
}

/** Reports a failure and returns the UserError to throw. */
export const failWith = (message, { cause, ...failure }) => {
  const error = new UserError(message, { cause });
  reportError(error, failure);
  return error;
};

/**
 * The one place that decides what a screen shows for a caught error: a UserError's
 * sentence unchanged, and plain words for anything else, which is a bug in our code
 * and has not been reported yet.
 */
export const getUserMessage = (error) => {
  if (error instanceof UserError) return error.message;
  reportError(error, { code: "unexpected" });
  return SERVER_FAILED;
};

/**
 * Calls one of our JSON APIs. Failures become a reported UserError here, where they
 * enter our code: our API's `error` field is already the sentence to show, and a
 * network failure or a reply from something else (a proxy's HTML page) gets plain
 * words.
 * @param {string} url
 * @param {RequestInit} [init]
 */
export const fetchJson = async (url, init = {}) => {
  const failure = { method: init.method || "GET", url };

  let response;
  try {
    response = await fetch(url, init);
  } catch (cause) {
    throw failWith(CONNECTION_FAILED, { ...failure, cause, code: "network" });
  }

  const details = {
    ...failure,
    status: response.status,
    cause: new Error(
      `${failure.method} ${url} answered ${response.status} ${response.statusText}`,
    ),
  };
  const isJson = (response.headers.get("content-type") || "").includes(
    "application/json",
  );

  if (!response.ok) {
    const data = isJson ? await response.json().catch(() => null) : null;
    throw failWith(data?.error || SERVER_FAILED, {
      ...details,
      code: data?.error ? "api_error" : "unusable_error_reply",
    });
  }
  if (response.status === 204) return null;
  if (!isJson) {
    throw failWith(SERVER_FAILED, { ...details, code: "not_json" });
  }
  return response.json();
};
