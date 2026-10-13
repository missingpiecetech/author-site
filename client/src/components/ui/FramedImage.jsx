import { FiligreeCorners } from "./Filigree";
import { getFiligree } from "./filigree/index.js";

const ASPECTS = {
  cover: "aspect-[2/3]",
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  wide: "aspect-[3/2]",
  none: "",
};

/**
 * Image in a gold frame (FRAME_BORDER) with filigree corners, an inset (12px mobile, 18px desktop) and the
 * deep cover shadow. With no `src`, renders a `surface` placeholder showing
 * `placeholder` text.
 *
 * - `aspect`: "cover" (2:3) | "portrait" (4:5) | "square" | "wide" (3:2) | "none".
 * - `shadow`: drop shadow on (default true).
 * - `imgClassName`: extra classes for the <img> (e.g. object-position).
 * - `filigree`: a style name from FILIGREE_STYLES (frame line and corners),
 *   e.g. "artDeco"; defaults to the site style.
 */
const FramedImage = ({
  src,
  alt = "",
  aspect = "cover",
  shadow = true,
  placeholder = "",
  className = "",
  imgClassName = "",
  loading = "lazy",
  filigree,
  ...rest
}) => (
  <div
    className={`relative ${getFiligree(filigree).FRAME_BORDER} border-accent p-3 lg:p-4.5 ${shadow ? "shadow-cover" : ""} ${className}`}
    {...rest}
  >
    <div className={`relative overflow-hidden ${ASPECTS[aspect] ?? ""}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          className={`block h-full w-full object-cover ${imgClassName}`}
        />
      ) : (
        <div
          role={placeholder ? "img" : undefined}
          aria-label={placeholder || undefined}
          className="flex h-full min-h-40 w-full items-center justify-center border border-edge bg-surface p-4 text-center text-base text-subtle"
        >
          {placeholder}
        </div>
      )}
    </div>
    <FiligreeCorners filigree={filigree} />
  </div>
);

export default FramedImage;
