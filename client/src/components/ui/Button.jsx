import { Link } from "react-router-dom";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-btn font-body no-underline transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

const SIZES = {
  lg: "h-13.5 px-7.5 text-[1.0625rem]", // 54px, 17px
  md: "h-12 px-5.5 text-base", // 48px, 16px
  sm: "h-11 px-5.5 text-[1.0625rem]", // 44px, 17px
};

const PRIMARY =
  "bg-accent text-ground font-medium hover:bg-accent-hover hover:text-ground border border-accent hover:border-accent-hover";
const SECONDARY =
  "bg-transparent text-cream border border-outline hover:border-accent hover:text-accent-hover";

const variantClasses = (variant, pressed) => {
  if (variant === "pill") return pressed ? PRIMARY : SECONDARY;
  if (variant === "secondary") return SECONDARY;
  return PRIMARY;
};

/**
 * Near-square button. Renders a router `Link` when `to` is set, an `<a>` when
 * `href` is set (external links open in a new tab unless `external={false}`),
 * otherwise a `<button type="button">`.
 *
 * - `variant`: "primary" (gold fill) | "secondary" (outline) | "pill" (toggle;
 *   pass `pressed`, which sets aria-pressed and the gold fill when true).
 * - `size`: "lg" 54px | "md" 48px | "sm" 44px.
 * - `block`: full width.
 */
const Button = ({
  variant = "primary",
  size = "lg",
  to,
  href,
  external,
  pressed,
  block = false,
  className = "",
  children,
  ...rest
}) => {
  const classes = [
    BASE,
    SIZES[size] ?? SIZES.lg,
    variantClasses(variant, pressed),
    block ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    const isExternal = external ?? /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      {...(variant === "pill" ? { "aria-pressed": Boolean(pressed) } : {})}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
