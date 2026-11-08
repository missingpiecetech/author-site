/**
 * Small uppercase gold label above a heading. Use the page's existing labels.
 * Pair it with its heading in a `gap-2` column and give the heading `trim-ascender`.
 */
const Eyebrow = ({ as = "p", className = "", children, ...rest }) => {
  const Tag = as;
  return (
    <Tag
      className={`trim-baseline font-body text-eyebrow uppercase tracking-eyebrow text-accent ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Eyebrow;
