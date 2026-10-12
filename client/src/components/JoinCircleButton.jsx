import Button from "./ui/Button";
import SITE_INFO from "../SITE_INFO";

/**
 * Opens the MailerLite newsletter popup. Defaults to the header's
 * "Join the Circle" label at 44px; pass `size`/`children` to reuse it.
 */
const JoinCircleButton = ({
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
      window.ml?.("show", SITE_INFO.newsletterFormId, true);
    }}
    {...rest}
  >
    {children}
  </Button>
);

export default JoinCircleButton;
