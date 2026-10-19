import { useEffect } from "react";

/** Full-screen enlarged image. Click anywhere or press Escape to close. */
const Lightbox = ({ image, onClose }) => {
  useEffect(() => {
    if (!image) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged view"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ground/90 p-4"
      onClick={onClose}
    >
      <img
        src={image}
        alt="Enlarged view"
        className="max-h-[90vh] max-w-[90vw] border border-accent object-contain"
      />
    </div>
  );
};

export default Lightbox;
