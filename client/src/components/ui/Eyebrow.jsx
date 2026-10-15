/** Small uppercase gold label above a heading. Use the page's existing labels. */
const Eyebrow = ({ as = "p", className = "", children, ...rest }) => {
  const Tag = as;
  return (
    <Tag
      className={`font-body text-eyebrow uppercase tracking-eyebrow text-accent ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Eyebrow;
