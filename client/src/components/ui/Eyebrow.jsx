/**
 * Small uppercase gold label above a heading. Use the page's existing labels.
 * Its 1em bottom margin (mb-eyebrow) sets the gap to the heading below; give
 * that heading `trim-ascender`.
 */
const Eyebrow = ({ as = "p", className = "", children, ...rest }) => {
  const Tag = as;
  return (
    <Tag
      className={`trim-baseline mb-eyebrow font-body text-eyebrow uppercase tracking-eyebrow text-accent ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Eyebrow;
