// What reaches GlitchTip: the status, code and field names of a failure, and no
// personal data, whichever SDK sends it.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { REPORTING_OPTIONS } from "../../shared/errors.js";

const sentry = vi.hoisted(() => ({
  scope: { setContext: vi.fn(), setTag: vi.fn() },
  captureException: vi.fn(),
}));

vi.mock("@sentry/cloudflare", () => ({
  captureException: sentry.captureException,
  withScope: (callback) => callback(sentry.scope),
}));

const { reportServerError } = await import("../../shared/serverErrors.js");

describe("reportServerError", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends Square's status, code and field names with the original error", () => {
    const error = Object.assign(new Error("Status code: 400"), {
      statusCode: 400,
      errors: [
        {
          code: "INVALID_VALUE",
          field: "order.line_items[0].quantity",
          detail: "bad",
        },
      ],
    });
    reportServerError(error, {
      request: new Request("https://site.test/api/square/checkout?token=abc", {
        method: "POST",
      }),
      status: 500,
      code: "square_checkout_failed",
    });

    expect(sentry.captureException).toHaveBeenCalledWith(error);
    expect(sentry.scope.setContext).toHaveBeenCalledWith("failure", {
      status: 500,
      code: "INVALID_VALUE",
      method: "POST",
      url: "https://site.test/api/square/checkout",
      upstreamStatus: 400,
      fields: ["order.line_items[0].quantity"],
    });
  });
});

describe("what leaves for GlitchTip", () => {
  it("drops request data and users, and masks emails and tokens in messages", () => {
    const event = REPORTING_OPTIONS.beforeSend({
      user: { email: "reader@example.com", ip_address: "1.2.3.4" },
      breadcrumbs: [{ message: "reader@example.com" }],
      request: {
        url: "https://site.test/store?email=reader@example.com#top",
        headers: { Authorization: "Bearer abc" },
        cookies: { session: "abc" },
        data: '{"emailAddress":"reader@example.com"}',
        query_string: "email=reader@example.com",
      },
      exception: {
        values: [
          {
            value:
              'Body: {"detail":"reader@example.com is taken"} Bearer sq0abc123',
          },
        ],
      },
    });

    expect(JSON.stringify(event)).not.toMatch(
      /reader@example|sq0abc123|1\.2\.3\.4|session/,
    );
    expect(event.request).toEqual({ url: "https://site.test/store" });
  });
});
