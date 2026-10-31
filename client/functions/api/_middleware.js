// Sets up GlitchTip reporting for every /api/* function. Lives under api/ so static
// pages stay free of function calls. Needs the `nodejs_als` compatibility flag and
// PUBLIC_GLITCHTIP_DSN on the Pages project.

import { sentryPagesPlugin } from "@sentry/cloudflare";
import { REPORTING_OPTIONS } from "../../shared/errors.js";

export const onRequest = sentryPagesPlugin((context) => {
  if (!context.env.PUBLIC_GLITCHTIP_DSN) {
    console.error(
      "PUBLIC_GLITCHTIP_DSN is not set: server errors are not reported.",
    );
  }
  return { dsn: context.env.PUBLIC_GLITCHTIP_DSN, ...REPORTING_OPTIONS };
});
