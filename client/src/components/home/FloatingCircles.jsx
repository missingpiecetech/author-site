/**
 * The hero's decorative background circles, in gold at 6–10% opacity.
 * Purely decorative: hidden from assistive tech and clipped to the parent,
 * which must be `relative`.
 */
const FloatingCircles = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 overflow-hidden"
  >
    <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-accent/8" />
    <div className="absolute bottom-40 left-1/10 h-40 w-40 rounded-full bg-accent/6" />
    <div className="absolute top-40 right-1/4 h-24 w-24 rounded-full bg-accent/10" />
    <div className="absolute right-10 bottom-20 h-28 w-28 rounded-full bg-accent/7" />
  </div>
);

export default FloatingCircles;
