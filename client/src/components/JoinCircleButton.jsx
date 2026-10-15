import Button from "./ui/Button";
import SITE_INFO from "../SITE_INFO";
import { EVENTS, track } from "../lib/analytics.js";

/**
 * Opens the MailerLite newsletter popup. Defaults to the header's
 * "Join the Circle" label at 44px; pass `size`/`children` to reuse it.
 * `placement` ("header", "mobile_menu", "newsletter") goes with the
 * newsletter_opened event.
 */
const JoinCircleButton = ({
  placement,
  size = "sm",
  children = "Join the Circle",
  onClick,
  ...rest
}) => (
  <Button
    size={size}
    aria-haspopup="dialog"
    onClick={(event) => {
      onClick?.(event);
      if (!window.ml) return;
      window.ml("show", SITE_INFO.newsletterFormId, true);
      track(EVENTS.NEWSLETTER_OPENED, { placement });
    }}
    {...rest}
  >
    {children}
  </Button>
);

export default JoinCircleButton;
