import { Link } from "react-router-dom";

const ROW =
  "flex items-center gap-4 border-b border-rule py-6 lg:gap-8 lg:py-7";

/** A list of rows separated by 1px `rule` lines (no cards). */
export const RuleList = ({ as = "ul", className = "", children, ...rest }) => {
  const Tag = as;
  return (
    <Tag className={`border-t border-rule ${className}`} {...rest}>
      {children}
    </Tag>
  );
};

/**
 * One row of a RuleList. With `to` (router) or `href` (external opens in a new
 * tab) the whole row is a link; `arrow` adds a trailing gold "→".
 */
export const RuleRow = ({
  as = "li",
  to,
  href,
  arrow = false,
  className = "",
  children,
  ...rest
}) => {
  const Tag = as;
  const content = (
    <>
      {children}
      {arrow && (
        <span aria-hidden="true" className="ml-auto text-accent">
          →
        </span>
      )}
    </>
  );

  if (to || href) {
    const linkClasses = `${ROW} text-cream no-underline transition-colors hover:text-accent-hover ${className}`;
    const isExternal = href && /^https?:\/\//.test(href);
    return (
      <Tag>
        {to ? (
          <Link to={to} className={linkClasses} {...rest}>
            {content}
          </Link>
        ) : (
          <a
            href={href}
            className={linkClasses}
            {...(isExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            {...rest}
          >
            {content}
          </a>
        )}
      </Tag>
    );
  }

  return (
    <Tag className={`${ROW} ${className}`} {...rest}>
      {content}
    </Tag>
  );
};

export default RuleList;
