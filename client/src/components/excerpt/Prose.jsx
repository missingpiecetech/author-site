import { parseInline } from "../../excerpts/index.js";

/**
 * One paragraph of excerpt text with its `*italic*` markup rendered as <em>.
 * Built from text nodes only (no innerHTML), so the source text can never
 * inject markup.
 */
const Prose = ({ text, className = "", ...rest }) => (
  <p className={className} {...rest}>
    {parseInline(text).map((segment, index) =>
      segment.italic ? <em key={index}>{segment.text}</em> : segment.text,
    )}
  </p>
);

export default Prose;
