// GlitchTip reporting for the Pages Functions. functions/api/_middleware.js sets
// up the SDK; without it (dev server, unit tests) reporting does nothing.

import { captureException, withScope } from "@sentry/cloudflare";

/**
 * Sends a server failure to GlitchTip with what happened and which input fields
 * failed. Square errors carry their status, code and field names; any other error
 * uses `code`.
 * @param {Error} error the original error
 * @param {{ request: Request, status: number, code: string }} failure
 */
export const reportServerError = (error, { request, status, code }) => {
  const upstreamErrors = Array.isArray(error?.errors) ? error.errors : [];
  const url = new URL(request.url);

  withScope((scope) => {
    scope.setContext("failure", {
      status,
      code: upstreamErrors[0]?.code || code,
      method: request.method,
      url: `${url.origin}${url.pathname}`,
      upstreamStatus: error?.statusCode ?? error?.status,
      fields: upstreamErrors.map((entry) => entry.field).filter(Boolean),
    });
    scope.setTag("http.status_code", String(status));
    scope.setTag("error.code", upstreamErrors[0]?.code || code);
    captureException(error);
  });
};

/** Reports that Square's settings are missing, naming them. */
export const reportSquareNotConfigured = (request) => {
  const error = new Error(
    "Square is not configured. Set SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, and SQUARE_ENVIRONMENT.",
  );
  console.error(error.message);
  reportServerError(error, {
    request,
    status: 500,
    code: "square_not_configured",
  });
};
